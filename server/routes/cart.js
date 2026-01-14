const router = require("express").Router();
const pool = require("../utils/db");
const { getCartId, repriceCart, getOrCreateCart, computePriceCents } = require("../utils/misc");

router.get("/", async (req, res) => {
    try {
        const cartId = getCartId(req);

        if (!cartId) {
            return res.json({
                id: null,
                items: [],
                subtotal_cents: 0
            });
        }

        await repriceCart(cartId).catch(() => {});

        const { rows } = await pool.query(`
            SELECT
                ci.id,
                ci.cart_id,
                ci.pizza_id,
                COALESCE(p.name, 'Custom pizza') AS display_name,
                p.image_url AS image_url,
                p.description AS description,
                ci.quantity,
                ci.unit_price_cents,
                (ci.unit_price_cents * ci.quantity) AS line_total_cents,

                json_build_object('id', b.id, 'name', b.name) AS base,
                json_build_object('id', s.id, 'name', s.name) AS sauce,

                p.base_id AS preset_base_id,
                p.sauce_id AS preset_sauce_id,

                -- preset toppings (objects)
                (
                    SELECT json_agg(json_build_object('id', t.id, 'name', t.name) ORDER BY t.id)
                    FROM UNNEST(p.topping_ids) pid(id)
                    JOIN toppings t ON t.id = pid.id
                ) AS preset_toppings,

                -- added toppings (objects)
                (
                    SELECT json_agg(json_build_object('id', t.id, 'name', t.name) ORDER BY t.id)
                    FROM UNNEST(ci.added_topping_ids) aid(id)
                    JOIN toppings t ON t.id = aid.id
                ) AS added_toppings,

                -- removed toppings (objects)
                (
                    SELECT json_agg(json_build_object('id', t.id, 'name', t.name) ORDER BY t.id)
                    FROM UNNEST(ci.removed_topping_ids) rid(id)
                    JOIN toppings t ON t.id = rid.id
                ) AS removed_toppings

            FROM cart_items ci
            LEFT JOIN pizzas p ON p.id = ci.pizza_id
            LEFT JOIN bases b ON b.id = ci.base_id
            LEFT JOIN sauces s ON s.id = ci.sauce_id

            WHERE ci.cart_id = $1
            ORDER BY ci.id
        `, [cartId]);

        const items = rows.map(r => {
            const preset = r.preset_toppings || [];
            const added = r.added_toppings || [];
            const removed = r.removed_toppings || [];

            const removedIds = new Set(removed.map(t => t.id));
            const addedIds = new Set(added.map(t => t.id));

            const final = [
                ...preset.filter(t => !removedIds.has(t.id)),
                ...added
            ];

            const regular = preset.filter(t => !addedIds.has(t.id));

            return {
                ...r,

                regular_toppings: regular,
                added_toppings: added,
                removed_toppings: removed,
                final_toppings: final,

                custom_base: r.base?.id !== r.preset_base_id ? r.base?.name : null,
                custom_sauce: r.sauce?.id !== r.preset_sauce_id ? r.sauce?.name : null,
            };
        });

        
        const subtotal = items.reduce((sum, r) => sum + Number(r.line_total_cents), 0);
        res.json({ id: cartId, items, subtotal_cents: subtotal });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

router.post("/items", async (req, res) => {
    try {
        const cartId = await getOrCreateCart(req, res);
        const {
            pizza_id = null,
            base_id, sauce_id,
            added_topping_ids = [],
            removed_topping_ids = [],
            quantity = 1
        } = req.body || {};

        if (!Number.isInteger(base_id) || !Number.isInteger(sauce_id) || !Number.isInteger(quantity) || quantity < 1) {
            return res.status(400).json({ error: "Invalid body!" });
        }

        if (!Array.isArray(added_topping_ids) || !added_topping_ids.every(Number.isInteger)) {
            return res.status(400).json({ error: "Added_topping_ids must be int[]!" });
        }

        if (!Array.isArray(removed_topping_ids) || !removed_topping_ids.every(Number.isInteger)) {
            return res.status(400).json({ error: "Removed_topping_ids must be int[]!" });
        }

        const price = await computePriceCents({ base_id, sauce_id, added_topping_ids, removed_topping_ids, pizza_id });

        const { rows } = await pool.query(
            `INSERT INTO cart_items (cart_id, pizza_id, base_id, sauce_id, added_topping_ids, removed_topping_ids, quantity, unit_price_cents)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *`,
            [cartId, pizza_id, base_id, sauce_id, added_topping_ids, removed_topping_ids, quantity, price]);

        res.status(201).json(rows[0]);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

router.patch("/items/:id", async (req, res) => {
    try {
        const cartId = getCartId(req);
        if (!cartId)return res.status(404).json({ error: "Uh oh, cart not found!" });

        const id = parseInt(req.params.id, 10);
        if (!Number.isInteger(id)) return res.status(400).json({ error: "Invalid id!" });

        const { quantity, added_topping_ids, removed_topping_ids } = req.body || {};

        const { rows: curRows } = await pool.query(
            `SELECT *
            FROM cart_items
            WHERE id=$1
            AND cart_id=$2`,
            [id, cartId]
        );

        if (!curRows.length) return res.status(404).json({ error: "Cart item not found!" });
        const cur = curRows[0];

        const nextQty = Number.isInteger(quantity) ? quantity : cur.quantity;
        if (nextQty < 1) return res.status(400).json({ error: "Quantity must be >= 1!" });

        const nextAdded = Array.isArray(added_topping_ids) ? added_topping_ids : cur.added_topping_ids;
        const nextRemoved = Array.isArray(removed_topping_ids) ? removed_topping_ids : cur.removed_topping_ids;

        let nextPrice = cur.unit_price_cents;
        if (Array.isArray(added_topping_ids) || Array.isArray(removed_topping_ids)) {
            nextPrice = await computePriceCents({ base_id: cur.base_id, sauce_id: cur.sauce_id, added_topping_ids: nextAdded, removed_topping_ids: nextRemoved, pizza_id: cur.pizza_id });
        }

        const { rows } = await pool.query(
            `UPDATE cart_items
            SET quantity = $1, added_topping_ids = $2, removed_topping_ids = $3, unit_price_cents = $4, updated_at = now()
            WHERE id = $5
            AND cart_id = $6
            RETURNING *`,
            [nextQty, nextAdded, nextRemoved, nextPrice, id, cartId]
        );

        res.json(rows[0]);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete("/items/:id", async (req, res) => {
    try {
        const cartId = getCartId(req);
        if (!cartId) return res.status(404).json({ error: "Cart not found!" });

        const id = parseInt(req.params.id, 10);

        const { rows } = await pool.query(
            `DELETE FROM cart_items
            WHERE id = $1
            AND cart_id = $2
            RETURNING *`,
            [id, cartId]
        );

        if (!rows.length) {
            return res.status(404).json({ error: "Cart item not found!" });
        }
        
        res.json({ ok: true, deleted: rows[0] });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
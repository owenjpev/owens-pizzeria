const router = require("express").Router();
const pool = require("../utils/db");

router.get("/:id/summary", async (req, res) => {
    try {
        const orderId = req.params.id;

        const { rows: ordRows } = await pool.query(
            `SELECT
                id,
                user_id,
                total_cents,
                subtotal_cents,
                delivery_cents,
                discount_cents,
                method,
                payment_status,
                payment_type,
                created_at,
                first_name,
                last_name,
                email,
                phone,
                address_line1,
                address_line2,
                suburb,
                state,
                postcode,
                notes
            FROM orders
            WHERE id = $1
            AND payment_status = 'unpaid'
            AND created_at >= now() - interval '6 days'
            LIMIT 1`,
            [orderId]
        );

        if (ordRows.length === 0) {
            return res.status(404).json({ error: "Order not payable! (expired or already paid)" });
        }

        const order = ordRows[0];

        const { rows } = await pool.query(
            `SELECT
                oi.id,
                oi.order_id,
                oi.pizza_id,
                COALESCE(p.name, 'Custom pizza') AS display_name,
                p.image_url AS image_url,
                p.description AS description,
                oi.quantity,
                oi.unit_price_cents,
                (oi.unit_price_cents * oi.quantity) AS line_total_cents,

                json_build_object('id', b.id, 'name', b.name) AS base,
                json_build_object('id', s.id, 'name', s.name) AS sauce,

                p.base_id AS preset_base_id,
                p.sauce_id AS preset_sauce_id,

                (
                    SELECT json_agg(json_build_object('id', t.id, 'name', t.name) ORDER BY t.id)
                    FROM UNNEST(p.topping_ids) pid(id)
                    JOIN toppings t ON t.id = pid.id
                ) AS preset_toppings,

                (
                    SELECT json_agg(json_build_object('id', t.id, 'name', t.name) ORDER BY t.id)
                    FROM UNNEST(oi.added_topping_ids) aid(id)
                    JOIN toppings t ON t.id = aid.id
                ) AS added_toppings,

                (
                    SELECT json_agg(json_build_object('id', t.id, 'name', t.name) ORDER BY t.id)
                    FROM UNNEST(oi.removed_topping_ids) rid(id)
                    JOIN toppings t ON t.id = rid.id
                ) AS removed_toppings

            FROM order_items oi

            LEFT JOIN pizzas p ON p.id = oi.pizza_id
            LEFT JOIN bases b ON b.id = oi.base_id
            LEFT JOIN sauces s ON s.id = oi.sauce_id

            WHERE oi.order_id = $1
            ORDER BY oi.id`,
            [orderId]
        );

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

        res.json({ order, items });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

module.exports = router;
const router = require("express").Router();
const pool = require("../../utils/db");
const { requireAdmin } = require("../../middleware/auth");

router.get("/", requireAdmin, async (req, res) => {
    try {
        const limit = Math.min(100, toInt(req.query.limit) || 50);
        const offset = Math.max(0, toInt(req.query.offset) || 0);

        const { rows } = await pool.query(
            `SELECT
                o.id,
                upper(split_part(o.id::text,'-',1)) AS order_code,
                o.first_name,
                o.last_name,
                o.email,
                o.phone,
                o.method,
                o.total_cents,
                o.delivery_cents,
                o.discount_cents,
                o.payment_type,
                o.payment_status,
                o.created_at,
                o.address_line1,
                o.address_line2,
                o.suburb,
                o.postcode,
                o.state
            FROM orders o
            ORDER BY o.created_at DESC
            LIMIT $1 OFFSET $2`,
            [limit, offset]
        );

        res.json({ items: rows, limit, offset });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

router.get("/:id", requireAdmin, async (req, res) => {
    try {
        const id = req.params.id;

        const { rows: oh } = await pool.query(
            `SELECT
                o.id,
                upper(split_part(o.id::text,'-',1)) AS order_code,
                o.first_name, o.last_name, o.email, o.phone,
                o.method,
                o.address_line1, o.address_line2, o.suburb, o.postcode, o.state,
                o.payment_type, o.payment_status,
                o.total_cents, o.delivery_cents, o.discount_cents,
                o.notes, o.created_at
            FROM orders o
            WHERE o.id = $1
            LIMIT 1`,
            [id]
        );

        if (oh.length === 0) {
            return res.status(404).json({ error: "Order not found!" });
        }

        const { rows: items } = await pool.query(
            `SELECT
                oi.id,
                oi.quantity,
                oi.unit_price_cents,
                (oi.unit_price_cents * oi.quantity) AS line_total_cents,
                oi.pizza_id,
                COALESCE(p.name, 'Custom pizza') AS display_name,
                p.image_url,

                json_build_object('id', b.id, 'name', b.name, 'price_cents', b.price_cents) AS base,
                json_build_object('id', s.id, 'name', s.name, 'price_cents', s.price_cents) AS sauce,

                COALESCE(p.topping_ids, '{}'::int[]) AS preset_topping_ids,
                COALESCE(a.added_toppings, '[]'::json) AS added_toppings,
                COALESCE(r.removed_toppings, '[]'::json) AS removed_toppings,
                COALESCE(f.final_toppings, '[]'::json) AS final_toppings
            FROM order_items oi

            LEFT JOIN pizzas p ON p.id = oi.pizza_id
            JOIN bases b ON b.id = oi.base_id
            JOIN sauces s ON s.id = oi.sauce_id

            LEFT JOIN LATERAL (
                SELECT json_agg(json_build_object('id', t.id, 'name', t.name, 'price_cents', t.price_cents) ORDER BY t.id) AS added_toppings
                FROM UNNEST(COALESCE(oi.added_topping_ids, '{}'::int[])) tid(id)
                JOIN toppings t ON t.id = tid.id
            ) a ON true

            LEFT JOIN LATERAL (
                SELECT json_agg(json_build_object('id', t.id, 'name', t.name, 'price_cents', t.price_cents) ORDER BY t.id) AS removed_toppings
                FROM UNNEST(COALESCE(oi.removed_topping_ids, '{}'::int[])) tid(id)
                JOIN toppings t ON t.id = tid.id
            ) r ON true

            LEFT JOIN LATERAL (
                WITH final_ids AS (
                    SELECT id FROM UNNEST(COALESCE(p.topping_ids, '{}'::int[])) x(id)
                    WHERE NOT (id = ANY (COALESCE(oi.removed_topping_ids, '{}'::int[])))
                    UNION
                    SELECT id FROM UNNEST(COALESCE(oi.added_topping_ids, '{}'::int[])) y(id)
                )
                SELECT json_agg(json_build_object('id', t.id, 'name', t.name, 'price_cents', t.price_cents) ORDER BY t.id) AS final_toppings
                FROM final_ids f
                JOIN toppings t ON t.id = f.id
            ) f ON true

            WHERE oi.order_id = $1
            ORDER BY oi.id`,
            [id]
        );

        res.json({ order: oh[0], items });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

module.exports = router;
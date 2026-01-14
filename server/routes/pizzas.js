const router = require("express").Router();
const pool = require("../utils/db");

router.get("/", async (req, res) => {
	try {
		const { rows } = await pool.query(
            `SELECT
				p.id,
				p.name,
				p.description,
				p.price_cents,
				p.image_url,
				json_build_object('id', b.id, 'name', b.name, 'price_cents', b.price_cents) AS base,
				json_build_object('id', s.id, 'name', s.name, 'price_cents', s.price_cents) AS sauce,
				COALESCE(t.toppings, '[]'::json) AS toppings
			FROM pizzas p

			JOIN bases  b ON b.id = p.base_id
			JOIN sauces s ON s.id = p.sauce_id

			LEFT JOIN LATERAL (
				SELECT json_agg(json_build_object('id', t.id, 'name', t.name, 'price_cents', t.price_cents) ORDER BY t.id) AS toppings
				FROM UNNEST(p.topping_ids) tid(id)
				JOIN toppings t ON t.id = tid.id
			) t ON true

			ORDER BY p.id`
        );
		res.json(rows);
	} catch (e) {
		res.status(500).json({ error: e.message });
	}
});

router.get("/:id", async (req, res) => {
	try {
		const id = parseInt(req.params.id, 10);

		if (!Number.isInteger(id)) {
            return res.status(400).json({ error: "Invalid id!" });
        }

		const { rows } = await pool.query(
            `SELECT
				p.id,
				p.name,
				p.description,
				p.price_cents,
				p.image_url,
				json_build_object('id', b.id, 'name', b.name, 'price_cents', b.price_cents) AS base,
				json_build_object('id', s.id, 'name', s.name, 'price_cents', s.price_cents) AS sauce,
				COALESCE(t.toppings, '[]'::json) AS toppings
			FROM pizzas p

			JOIN bases  b ON b.id = p.base_id
			JOIN sauces s ON s.id = p.sauce_id

			LEFT JOIN LATERAL (
				SELECT json_agg(json_build_object('id', t.id, 'name', t.name, 'price_cents', t.price_cents) ORDER BY t.id) AS toppings
				FROM UNNEST(p.topping_ids) tid(id)
				JOIN toppings t ON t.id = tid.id
			) t ON true

			WHERE p.id = $1`,
            [id]
        );

		if (rows.length === 0) {
            return res.status(404).json({ error: "Pizza not found!" });
        }

		res.json(rows[0]);
	} catch (e) {
		res.status(500).json({ error: e.message });
	}
});

module.exports = router;
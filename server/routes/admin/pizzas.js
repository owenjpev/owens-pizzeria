const router = require("express").Router();
const pool = require("../../utils/db");
const { requireAdmin } = require("../../middleware/auth");
const { conflict } = require("../../utils/misc");

router.delete("/:id", requireAdmin, async (req, res) => {
	try {
		const id = Number(req.params.id, 10);

		if (!Number.isInteger(id)) {
            return res.status(400).json({ error: "Invalid id!" });
        }

		const { rows } = await pool.query(
            `DELETE FROM pizzas
            WHERE id = $1
            RETURNING *`,
            [id]
        );

		if (rows.length === 0) {
            return res.status(404).json({ error: "Pizza not found" });
        }

		res.status(200).json({ ok: true, deleted: rows[0] });
	} catch (e) {
		res.status(500).json({ error: e.message });
	}
});

router.post("/", requireAdmin, async (req, res) => {
	try {
		const {
            name,
            description = null,
            base_id,
            sauce_id,
            topping_ids = [],
            price_cents,
            image_url = null
        } = req.body || {};

		if (
            !name ||
            !Number.isInteger(base_id) ||
            !Number.isInteger(sauce_id) ||
            !Array.isArray(topping_ids) ||
            !topping_ids.every(Number.isInteger) ||
            !Number.isInteger(price_cents) ||
            price_cents < 0
        ) {
		    return res.status(400).json({ error: "Invalid body: {name, description?, base_id, sauce_id, topping_ids:int[], price_cents, image_url?}!" });
		}

		const { rows } = await pool.query(
            `INSERT INTO pizzas (name, description, base_id, sauce_id, topping_ids, price_cents, image_url)
            VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [name.trim(), (description && String(description).trim()) || null, base_id, sauce_id, topping_ids, price_cents, image_url]
        );

		res.status(201).json(rows[0]);
	} catch (e) {
		if (conflict(e)) return res.status(409).json({ error: "That name already exists!" });
		res.status(500).json({ error: e.message });
	}
});

module.exports = router;
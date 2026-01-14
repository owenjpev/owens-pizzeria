const router = require("express").Router();
const pool = require("../../utils/db");
const { requireAdmin } = require("../../middleware/auth");
const { conflict } = require("../../utils/misc");

router.post("/", requireAdmin, async (req, res) => {
	try {
		const name = req.body?.name?.trim();
		const priceCents = Number(req.body?.priceCents);

		if (!name || !Number.isInteger(priceCents) || priceCents < 0) {
            return res.status(400).json({ error: "Name and non-negative priceCents required!" });
        }

		const { rows } = await pool.query(
            `INSERT INTO bases (name, price_cents)
            VALUES ($1, $2)
            RETURNING *`,
            [name, priceCents]
        );

		res.status(201).json(rows[0]);
	} catch (e) {
		if (conflict(e)) return res.status(409).json({ error: "That name already exists!" });
		res.status(500).json({ error: e.message });
	}
});

router.put("/:id", requireAdmin, async (req, res) => {
	try {
		const id = Number(req.params.id);
		const name = req.body?.name?.trim();
		const priceCents = Number(req.body?.priceCents);

		if (!Number.isInteger(id)) {
            return res.status(400).json({ error: "Invalid id!" });
        }

		if (!name || !Number.isInteger(priceCents) || priceCents < 0) {
            return res.status(400).json({ error: "Name and non-negative priceCents required!" });
        }

		const { rows } = await pool.query(
            `UPDATE bases
            SET name = $1, price_cents = $2
            WHERE id = $3
            RETURNING *`,
            [name, priceCents, id]
        );

		if (rows.length === 0) {
            return res.status(404).json({ error: "Base not found!" });
        }

		res.status(200).json(rows[0]);
	} catch (e) {
		if (conflict(e)) return res.status(409).json({ error: "That name already exists!" });
		res.status(500).json({ error: e.message });
	}
});

router.delete("/:id", async (req, res) => {
	try {
		const id = Number(req.params.id);

		if (!Number.isInteger(id)) {
            return res.status(400).json({ error: "Invalid id!" });
        }

		const { rows } = await pool.query(
            `DELETE FROM bases
            WHERE id = $1
            RETURNING *`,
            [id]
        );

		if (rows.length === 0) {
            return res.status(404).json({ error: "Base not found!" });
        }

		res.status(200).json({ ok: true, deleted: rows[0] });
	} catch (e) {
		res.status(500).json({ error: e.message });
	}
});

module.exports = router;
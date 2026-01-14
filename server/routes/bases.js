const router = require("express").Router();
const pool = require("../utils/db");

router.get("/", async (_req, res) => {
	try {
		const { rows } = await pool.query(
            `SELECT id, name, price_cents
            FROM bases
            ORDER BY id`
        );
        
		res.status(200).json(rows);
	} catch (e) {
		res.status(500).json({ error: e.message });
	}
});

module.exports = router;
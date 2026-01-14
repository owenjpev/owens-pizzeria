const pool = require("../utils/db");

async function requireAuth (req, res, next) {
	if (!req.session?.userId) {
		return res.status(401).json({ error: "Access forbidden!" });
	}
	next();
};

async function requireAdmin(req, res, next) {
	try {
		if (!req.session?.userId) {
			return res.status(401).json({ error: "You are not logged in!" });
		}

		const { rows } = await pool.query(
			`SELECT is_admin
			FROM users
			WHERE id = $1`,
			[req.session.userId]
		);

		if (!rows.length) return res.status(404).json({ error: "User not found!" });
		if (!rows[0].is_admin) return res.status(403).json({ error: "Access forbidden!" });

		next();
	} catch (e) {
		res.status(500).json({ error: e.message });
	}
};

module.exports = {
	requireAuth,
	requireAdmin
}
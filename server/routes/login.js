const router = require("express").Router();
const pool = require("../utils/db");
const bcrypt = require("bcrypt");

router.post("/", async (req, res) => {
    try {
        const { email, password } = req.body || {};

        if (!email || !password) {
            return res.status(400).json({ error: "Missing email or password!" });
        }

        const { rows } = await pool.query(
            `SELECT id, password_hash, is_admin
            FROM users WHERE
            email = $1`,
            [email]
        );

        if (rows.length === 0) {
            return res.status(401).json({ error: "Invalid credentials!" });
        }

        const ok = await bcrypt.compare(password, rows[0].password_hash);
        if (!ok) return res.status(401).json({ error: "Invalid credentials!" });

        let redirectLink = "/my-orders";

        req.session.userId = rows[0].id;
        req.session.isAdmin = rows[0].is_admin === true;

        if (rows[0].is_admin === true) {
            redirectLink = "/admin"
        }

        res.json({
            id: rows[0].id,
            email,
            is_admin: rows[0].is_admin,
            redirectLink
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

module.exports = router;
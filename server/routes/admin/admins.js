const router = require("express").Router();
const pool = require("../../utils/db");
const { requireAdmin } = require("../../middleware/auth");
const bcrypt = require("bcrypt");
const SALT_ROUNDS = 11;

router.get("/admins", requireAdmin, async (req, res) => {
    try {
        const { rows } = await pool.query(
            `SELECT email FROM users WHERE is_admin = $1`,
            [true]
        );

        res.status(200).json({ admins: rows })
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
})

router.post("/admins", requireAdmin, async (req, res) => {
    try {
        const { email, password } = req.body || {};
        if (!email || !password || password.length < 6) {
            return res.status(400).json({ error: "Invalid email or password!" });
        }

        const hash = await bcrypt.hash(password, SALT_ROUNDS);

        const { rows } = await pool.query(
            `INSERT INTO users (email, password_hash, is_admin)
            VALUES ($1, $2, true)
            RETURNING id, email, created_at, is_admin`,
            [email, hash]
        );

        req.session.userId = rows[0].id;
        req.session.isAdmin = true;

        res.status(201).json({
            id: rows[0].id,
            email: rows[0].email,
            is_admin: true
        });
    } catch (e) {
        if (e.code === "23505") return res.status(409).json({ error: "That email is already registered!" });
        res.status(500).json({ error: e.message });
    }
});

module.exports = router;
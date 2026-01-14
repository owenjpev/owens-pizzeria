const router = require("express").Router();
const pool = require("../utils/db");
const bcrypt = require("bcrypt");
const SALT_ROUNDS = 11;

router.post("/api/users", async (req, res) => {
    try {
        const { email, password } = req.body || {};

        if (!email || !password || password.length < 6) {
            return res.status(400).json({ error: "Invalid email or password!" });
        }

        const hash = await bcrypt.hash(password, SALT_ROUNDS);
        const { rows } = await pool.query(
            `INSERT INTO users (email, password_hash)
            VALUES ($1, $2)
            RETURNING id, email, created_at`,
            [email, hash]
        );

        req.session.userId = rows[0].id;
        res.status(201).json({ id: rows[0].id, email: rows[0].email });
    } catch (e) {
        if (e.code === "23505") return res.status(409).json({ error: "That email is already registered!" });
        res.status(500).json({ error: e.message });
    }
});

module.exports = router;
const router = require("express").Router();

router.post("/", (req, res) => {
    req.session.destroy(() => res.json({ ok: true }));
});

module.exports = router;
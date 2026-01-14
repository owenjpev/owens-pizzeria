const router = require("express").Router();
const pool = require("../utils/db");
const getPayableOrder = require("../utils/misc")
const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

router.post("/checkout-session", async (req, res) => {
    try {
        const { order_id, success_url, cancel_url } = req.body || {};

        if (!order_id) {
            return res.status(400).json({ error: "Order_id required!" });
        }

        const order = await getPayableOrder(pool, order_id);

        if (!order) {
            return res.status(404).json({ error: "Order not payable! (expired or already paid)." });
        }

        const unit_amount = Math.max(0, parseInt(order.total_cents, 10));

        if (!unit_amount) {
            return res.status(400).json({ error: "Order total is zero!" });
        }

        const session = await stripe.checkout.sessions.create({
            mode: "payment",
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: "aud",
                        unit_amount,
                        product_data: { name: `Pizza Order ${order.id}` }
                    },
                    quantity: 1
                }
            ],
            customer_email: order.email || undefined,
            metadata: { order_id: order.id },
            expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
            success_url: success_url || `${process.env.PUBLIC_BASE_URL}/payment/success?id=${order.id}`,
            cancel_url: cancel_url || `${process.env.PUBLIC_BASE_URL}/payment/cancel?id=${order.id}`
        });

        res.status(201).json({ id: session.id, url: session.url });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

router.post("/create-intent", async (req, res) => {
    try {
        const { order_id } = req.body || {};

        if (!order_id) {
            return res.status(400).json({ error: "Order_id required!" });
        }

        const o = await getPayableOrder(pool, order_id);

        if (!o) {
            return res.status(404).json({ error: "Order not payable! (expired or already paid)" });
        }

        const amount = Math.max(0, parseInt(o.total_cents, 10));

        if (!amount) {
            return res.status(400).json({ error: "Order total is zero!" });
        }

        let pi = null;

        if (o.stripe_payment_intent_id) {
            pi = await stripe.paymentIntents.retrieve(o.stripe_payment_intent_id);

            if (pi.amount !== amount && ["requires_payment_method","requires_confirmation","requires_action","processing"].includes(pi.status)) {
                pi = await stripe.paymentIntents.update(pi.id, { amount });
            }

            if (["canceled","succeeded"].includes(pi.status)) pi = null;
        }

        if (!pi) {
            pi = await stripe.paymentIntents.create({
                amount,
                currency: "aud",
                automatic_payment_methods: { enabled: true },
                receipt_email: o.email || undefined,
                metadata: { order_id: o.id },
            });

            const update = await pool.query(
                `UPDATE orders
                SET stripe_payment_intent_id = $1
                WHERE id = $2`,
                [pi.id, o.id]
            );
        }

        return res.status(201).json({
            order_id: o.id,
            client_secret: pi.client_secret,
            publishable_key: process.env.STRIPE_PUBLISHABLE_KEY,
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

module.exports = router;
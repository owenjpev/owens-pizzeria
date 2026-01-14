const router = require("express").Router();
const pool = require("../utils/db");
const { getCartId } = require("../utils/misc");

router.post("/", async (req, res) => {
    try {
        const cartId = getCartId(req);
        if (!cartId) return res.status(400).json({ error: "Cart not found!" });

        const userId = req.session.userId || null
        const isDelivery = method === "delivery";
        const {
            first_name = "",
            last_name = "",
            email = "",
            phone = "",
            method = "pickup",
            address_line1 = null,
            address_line2 = null,
            suburb = null,
            state = null,
            postcode = null,
            notes = "" ,
            payment_type = "card"
        } = req.body || {};

        if (!first_name.trim() || !last_name.trim()) {
            return res.status(400).json({ error: "Your name is missing!" });
        }

        if (!email.includes("@")) {
            return res.status(400).json({ error: "Please enter a valid email!" });
        }

        if (isDelivery && (!address_line1 || !suburb || !state || !postcode)) {
            return res.status(400).json({ error: "Your address is missing!" });
        }

        const { rows: items } = await pool.query(
            `SELECT id, quantity, unit_price_cents, pizza_id, base_id, sauce_id, added_topping_ids, removed_topping_ids
            FROM cart_items
            WHERE cart_id = $1
            ORDER BY id`,
            [cartId]
        );

        if (items.length === 0) {
            return res.status(400).json({ error: "Your cart is empty!" });
        }

        const subtotal = items.reduce((s, r) => s + money(r.unit_price_cents) * r.quantity, 0);
        const delivery = isDelivery ? 500 : 0;
        const discount = 0;
        const total = money(subtotal + delivery - discount);

        await pool.query("BEGIN");

        const ord = await pool.query(
            `INSERT INTO orders (
                first_name, last_name, email, phone,
                method,
                address_line1, address_line2, suburb, state, postcode,
                subtotal_cents, delivery_cents, discount_cents, total_cents,
                payment_type, payment_status,
                notes,
                user_id
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, 'unpaid', $16, $17)
            RETURNING id`,
            [
                first_name.trim(), last_name.trim(), email.trim(), phone.trim(),
                method,
                address_line1, address_line2, suburb, state, postcode,
                subtotal, delivery, discount, total,
                payment_type,
                notes,
                userId
            ]
        );
        const orderId = ord.rows[0].id;

        await pool.query(
            `INSERT INTO order_items (
                order_id, pizza_id, base_id, sauce_id, added_topping_ids, removed_topping_ids, quantity, unit_price_cents
            )

            SELECT $1, pizza_id, base_id, sauce_id, added_topping_ids, removed_topping_ids, quantity, unit_price_cents
            FROM cart_items WHERE cart_id = $2`,
            [orderId, cartId]
        );

        await pool.query(
            `UPDATE carts
            SET status = 'converted', updated_at = now()
            WHERE id = $1`,
            [cartId]
        );

        res.clearCookie("cart_id", { 
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production"
        });

        await pool.query("COMMIT");

        res.status(201).json({
            order_id: orderId,
            total_cents: total
        });
    } catch (e) {
        await (pool && pool.query ? pool.query("ROLLBACK") : Promise.resolve());
        res.status(500).json({ error: e.message });
    } finally {
        pool.release();
    }
});

module.exports = router;
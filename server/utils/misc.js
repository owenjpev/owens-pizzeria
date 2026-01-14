const pool = require("../utils/db");

const COOKIE = "cart_id";

async function computePriceCents({ pizza_id = null, base_id, sauce_id, added_topping_ids = [], removed_topping_ids = [] }) {
    const addedSet = new Set((added_topping_ids || []).filter(Number.isInteger));
    const addedList = Array.from(addedSet);

    if (pizza_id == null) {
        const [bRes, sRes] = await Promise.all([
            pool.query("SELECT price_cents FROM bases WHERE id=$1", [base_id]),
            pool.query("SELECT price_cents FROM sauces WHERE id=$1", [sauce_id]),
        ]);
        
        if (bRes.rowCount === 0) throw new Error("Invalid base_id!");
        if (sRes.rowCount === 0) throw new Error("Invalid sauce_id!");

        let total = Number(bRes.rows[0].price_cents) + Number(sRes.rows[0].price_cents);

        if (addedList.length > 0) {
            const tRes = await pool.query("SELECT price_cents FROM toppings WHERE id = ANY($1)", [addedList]);

            for (const r of tRes.rows) {
                total += Number(r.price_cents);
            }
        }

        return Math.max(0, Math.trunc(total));
    }

    const pRes = await pool.query(
        `SELECT price_cents, topping_ids
        FROM pizzas
        WHERE id = $1`,
        [pizza_id]
    );

    if (pRes.rowCount === 0) throw new Error("Invalid pizza_id");

    const presetPrice = Number(pRes.rows[0].price_cents);
    const presetIds = new Set((pRes.rows[0].topping_ids || []).filter(Number.isInteger));
    const extraIds = addedList.filter(id => !presetIds.has(id));

    let total = presetPrice;

    if (extraIds.length > 0) {
        const tRes = await pool.query("SELECT price_cents FROM toppings WHERE id = ANY($1)", [extraIds]);
        for (const r of tRes.rows) total += Number(r.price_cents);
    }

    return Math.max(0, Math.trunc(total));
}

function getCartId(req) {
  	return req.cookies?.[COOKIE] || null;
}

async function getOrCreateCart(req, res) {
	let cartId = getCartId(req);

	if (cartId) {
		const { rows } = await pool.query(
            `SELECT id
            FROM carts
            WHERE id=$1
            AND status='active'`,
            [cartId]
        );

		if (rows.length) return rows[0].id;
	}

	const { rows } = await pool.query(
        `INSERT INTO carts (status)
        VALUES ('active')
        RETURNING id`
    );

	cartId = rows[0].id;

	res.cookie(COOKIE, cartId, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 1000 * 60 * 60 * 24 * 7
    });

	return cartId;
}

async function repriceCart(cartId) {
    const { rows } = await pool.query(
        `SELECT id, pizza_id, base_id, sauce_id, added_topping_ids, removed_topping_ids
        FROM cart_items
        WHERE cart_id=$1`,
        [cartId]
    );

    for (const r of rows) {
        const price = await computePriceCents({
            pizza_id: r.pizza_id,
            base_id: r.base_id,
            sauce_id: r.sauce_id,
            added_topping_ids: r.added_topping_ids || [],
            removed_topping_ids: r.removed_topping_ids || []
        });

        await pool.query(
            `UPDATE cart_items
            SET unit_price_cents=$1
            WHERE id=$2`,
            [price, r.id]
        );
    }
}

async function getPayableOrder(client, orderId) {
    const { rows } = await client.query(
        `SELECT id, first_name, last_name, email, total_cents, payment_status, created_at
        FROM orders
        WHERE id = $1
        AND payment_status = 'unpaid'
        AND created_at >= now() - interval '5 days'
        LIMIT 1`,
        [orderId]
    );

    return rows[0] || null;
}

function conflict(e) {
    return e?.code === "23505";
}

async function toInt(v) {
    if (v === null || v === undefined) return NaN;
    const n = Number(v);
    return Number.isInteger(n) ? n : NaN;
}


module.exports = {
    computePriceCents,
    getCartId,
    getOrCreateCart,
    repriceCart,
    getPayableOrder,
    conflict,
    toInt
}
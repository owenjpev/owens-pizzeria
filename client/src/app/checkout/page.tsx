"use client";

import React, { useState, useEffect } from "react";
import Input, { Textarea, RadioGroup } from "@/components/Form";
import Main from "@/components/Main";
import type { CartResponse } from "@/types";
import Title from "@/components/Text";
import { ButtonSolid } from "@/components/Buttons";
import { money, API } from "@/components/Functions";

export default function CheckoutPage() {
	const [cart, setCart] = useState<CartResponse>({ id: null, items: [], subtotal_cents: 0 });

	const [first, setFirst] = useState("");
	const [last, setLast] = useState("");
	const [email, setEmail] = useState("");
	const [phone, setPhone] = useState("");

	const [method, setMethod] = useState<"pickup" | "delivery">("pickup");

	const [a1, setA1] = useState("");
	const [a2, setA2] = useState("");
	const [suburb, setSuburb] = useState("");
	const [state, setState] = useState("");
	const [postcode, setPostcode] = useState("");

	const [notes, setNotes] = useState("");
	const [paymentType, setPaymentType] = useState<"card" | "cash">("card");
	
	const [loading, setLoading] = useState(false);
	const [msg, setMsg] = useState<string | null>(null);

	const deliveryFee = method === "delivery" ? 500 : 0;
	const discount = 0;
	const total = cart.subtotal_cents + deliveryFee - discount;

	useEffect(() => { loadCart() }, []);

	async function loadCart() {
		if (!API) {
			setMsg("Uh oh! Something went wrong...");
			return;
		}

		setLoading(true);
		setMsg(null);

		try {
			const res = await fetch(API + "cart", { cache: "no-store", credentials: "include" });

			if (!res.ok) {
				throw new Error(`GET /cart: ${res.status}`);
			}

			const data = await res.json() as CartResponse;
			setCart(data);
		} catch (e: any) {
			setMsg(e.message || "Uh oh! It looks like something went wrong with loading your cart...");
		} finally {
			setLoading(false);
		}
	}

	async function submitOrder() {
		if (cart.items.length === 0) {
			return setMsg("Your cart is empty.");
		}

		if (!first.trim() || !last.trim()) {
			return setMsg("Enter your name.");
		
		}

		if (!email.includes("@")) {
			return setMsg("Enter a valid email.");
		}

		if (method === "delivery" && (!a1.trim() || !suburb.trim() || !state.trim() || !postcode.trim())) {
			return setMsg("Fill your delivery address.");
		}

		setLoading(true);
		setMsg(null);

		try {
			const body = {
				first_name: first.trim(),
				last_name: last.trim(),
				email: email.trim(),
				phone: phone.trim(),

				method,

				address_line1: a1 || null,
				address_line2: a2 || null,
				suburb: suburb || null,
				state: state || null,
				postcode: postcode || null,

				notes,
				payment_type: paymentType
			};

			const res = await fetch(API + "checkout", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(body),
				credentials: "include"
			});

			const data = await res.json().catch(() => null);

			if (!res.ok) {
				throw new Error(data?.error || `POST /checkout: ${res.status}`);
			}
			
			window.location.href = `/payment?id=${data.order_id}`;
		} catch (e: any) {
			setMsg(e.message || "Uh oh! It looks like something went wrong with placing your order. Please try again later");
		} finally {
			setLoading(false);
		}
	}

	return (
		<Main>
			<Title text="Checkout" className="mb-16" />

			{msg && (
				<p className="mb-16">{msg}</p>
			)}

			<div className="w-full max-w-5xl flex flex-col md:flex-row gap-12 md:gap-6">
				<div className="w-full">

					<p className="mb-2">Who are you?</p>
					<div className="space-y-4 mb-8">
						<div className="w-full flex flex-col md:flex-row gap-4">
							<Input name="first" label="First name" value={first} onChange={(e) => setFirst(e.target.value)} />
							<Input name="last" label="Last name" value={last} onChange={(e) => setLast(e.target.value)} />
						</div>
						<div className="w-full flex flex-col md:flex-row gap-4">
							<Input name="email" label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
							<Input name="phone" label="Phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
						</div>
					</div>

					<div className="w-full mb-8">
						<RadioGroup
							label="Which method would you like?"
							name="method"
							options={[{ label: "Pickup", value: "pickup" }, { label: "Delivery", value: "delivery" }]}
							value={method}
							onChange={(e) => setMethod(e.target.value as "pickup" | "delivery")}
						/>
					</div>

					{method === "delivery" && (
						<>
							<p className="mb-2">Where are we delivering to?</p>
							<div className="space-y-4 mb-8">
								<Input name="a1" label="Address line 1" value={a1} onChange={(e) => setA1(e.target.value)} />
								<Input name="a2" label="Address line 2 (optional)" value={a2} onChange={(e) => setA2(e.target.value)} />

								<div className="w-full flex flex-col md:flex-row gap-4">
									<Input name="suburb" label="Suburb" value={suburb} onChange={(e) => setSuburb(e.target.value)} />
									<Input name="postcode" label="Postcode" value={postcode} onChange={(e) => setPostcode(e.target.value)} />
								</div>
								<Input name="state" label="State" value={state} onChange={(e) => setState(e.target.value)} />
							</div>
						</>
					)}

					<div className="w-full">
						<p className="mb-2">Anything we should know?</p>
						<Textarea
							name="notes"
							label="Notes (optional)"
							value={notes}
							className="mb-8"
							onChange={(e) => setNotes(e.target.value)}
						/>
					</div>

					<RadioGroup
						label="What will you be paying with?"
						name="payment"
						options={[{ label: "Card", value: "card" }, { label: "Cash", value: "cash" }]}
						value={paymentType}
						onChange={(e) => setPaymentType(e.target.value as "card" | "cash")}
					/>
					
				</div>
				<div className="w-full">
					<p className="mb-4">Your cart</p>
					<div className="w-full flex flex-col gap-4">
						{cart.items.map(item => (
							<div className="border-b border-zinc-300 pb-4">
								<div className="w-full flex justify-between gap-4 font-semibold text-lg mb-1">
									<p>{item.display_name || "Custom Pizza"} (x{item.quantity})</p>
									<p>{money(item.line_total_cents)}</p>
								</div>

								<p className="text-zinc-600 text-sm">
									{item.description}
								</p>

								{item.custom_base && (
									<p className="text-sm text-zinc-600 mt-2">{item.custom_base} Crust</p>
								)}

								{item.custom_sauce && (
									<p className="text-sm text-zinc-600">{item.custom_sauce} Base</p>
								)}

								{item.added_toppings?.length > 0 && (
									<div className="flex flex-col text-green-500 text-sm mt-2">
										{item.added_toppings.map(t => (
											<p key={t.id}>+ {t.name}</p>
										))}
									</div>
								)}

								{item.removed_toppings?.length > 0 && (
									<div className="flex flex-col text-red-500 text-sm mt-2">
										{item.removed_toppings.map(t => (
											<p key={t.id}>+ {t.name}</p>
										))}
									</div>
								)}
							</div>
						))}
					</div>

					<div className="w-full mt-4">
						<div className="w-full flex justify-between items-center text-zinc-600 text-sm gap-4">
							<p>Subtotal</p>
							<p>{money(cart.subtotal_cents)}</p>
						</div>

						{method === "delivery" && (
							<div className="w-full flex justify-between items-center text-zinc-600 text-sm gap-4">
								<p>Delivery</p>
								<p>{money(deliveryFee)}</p>
							</div>
						)}

						{discount > 0 && (
							<div className="w-full flex justify-between items-center text-zinc-600 text-sm gap-4">
								<p>Discount</p>
								<p>-{money(discount)}</p>
							</div>
						)}

						<div className="w-full flex justify-between items-center font-semibold gap-4 text-lg mt-1 mb-4">
							<p>Total</p>
							<p>{money(total)}</p>
						</div>

						<ButtonSolid
							onClick={submitOrder}
							disabled={loading || cart.items.length === 0}
							text={loading ? "Placing order…" : "Continue to payment"}
						/>
					</div>
				</div>
			</div>
		</Main>
	);
}

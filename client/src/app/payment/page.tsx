"use client";

import React, { useState, useEffect, FormEvent, use } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import Main from "@/components/Main";
import Title from "@/components/Text";
import Overlay, { OrderSummary } from "@/components/Misc";
import { OrderDetail } from "@/components/Misc";
import { PrettyCase, money } from "@/components/Functions";
import { XMarkIcon } from "@heroicons/react/24/outline";
import type { Item, Order } from "@/types";
import { API } from "@/components/Functions";

function PayForm({ orderId, setMsg }: { orderId: string; setMsg: (s: string | null) => void }) {
	const stripe = useStripe();
	const elements = useElements();
	const [processing, setProcessing] = useState(false);

	async function onSubmit(e: FormEvent) {
		e.preventDefault();
		if (!stripe || !elements) {
			return;
		}

		setProcessing(true);
		setMsg(null);
		
		const { error } = await stripe.confirmPayment({
			elements,
			confirmParams: {
				return_url: window.location.origin + `/payment/success?id=${orderId}`,
			},
			redirect: "if_required"
		});

		if (error) {
			setMsg(error.message || "Payment failed.");
		} else {
			setMsg("Payment processing…");
			window.location.href = `/payment/success?id=${orderId}`;
		}

		setProcessing(false);
	}

	return (
		<form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
			<h2 className="text-lg font-medium text-slate-900">Pay securely</h2>
			<PaymentElement id="payment-element" />
			<button type="submit" disabled={!stripe || !elements || processing} className="inline-flex w-full items-center justify-center rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700 disabled:opacity-60">
				{processing ? "Paying…" : "Pay now"}
			</button>
		</form>
	);
}

export default function PaymentPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
    const params = use(searchParams);
    const orderId = params.id || "";

	const [showOverlay, setShowOverlay] = useState(false);
	const [showOrder, setShowOrder] = useState(false);

	const [clientSecret, setClientSecret] = useState<string>("");
	const [publishableKey, setPublishableKey] = useState<string>("");
	const [msg, setMsg] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [order, setOrder] = useState<Order | null>(null)
	const [items, setItems] = useState<Item[]>([])

	async function load() {
		if (!API || !orderId) {
			setMsg("It looks like we're missing an order id...");
			return;
		}

		if (!order) {
			setMsg("Uh oh! It looks like something went wrong trying to retrieve your order...");
			return;
		}

		setLoading(true);

		try {
			const summaryRes = await fetch(API + `orders/${orderId}/summary`, { cache: "no-store" });
			const summaryData = await summaryRes.json();

			if (!summaryRes.ok) {
				throw new Error(summaryData?.error || `GET orders/${orderId}/summary: ${summaryRes.status}`);
			}

			setOrder(summaryData.order);
			setItems(summaryData.items);



			const paymentRes = await fetch(API + "payments/create-intent", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ order_id: orderId })
			});
			const paymentData = await paymentRes.json();

			if (!paymentRes.ok) {
				throw new Error(paymentData?.error || `GET orders/${orderId}/summary: ${paymentRes.status}`);
			}

			setClientSecret(paymentData.client_secret);
			setPublishableKey(paymentData.publishable_key);
		} catch (e: any) {
			setError(e.error || "Uh oh! It looks like something went wrong...");
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		load();
	}, [API, orderId]);

	if (!clientSecret || !publishableKey || !order) {
		return (
			<Main>
				<Title text="Payment" className="mb-4" />
				{msg ? <p className="text-red-600">{msg}</p> : <p className="text-zinc-600">Loading...</p>}
			</Main>
		);
	}

	const stripePromise = loadStripe(publishableKey);

	return (
		<Main>
			<Overlay showOverlay={showOverlay} onClick={() => {setShowOverlay(false); setShowOrder(false)}} />
			<OrderSummary showOrder={showOrder}>
				<button
					className="absolute top-5 md:top-4 right-5 md:right-4 text-zinc-400 text-lg cursor-pointer" 
					onClick={() => {setShowOverlay(false); setShowOrder(false)}}
				>
					<XMarkIcon className="w-6 h-6 md:w-5 md:h-5" />
				</button>
				<div id="checkout" className="w-full">
					<p className="font-semibold mb-2 text-orange-500">Your information</p>
					<div className="space-y-3 mb-10">
						<OrderDetail label="Name" value={`${order.first_name} ${order.last_name}`} />

						<div className="w-full flex flex-col md:flex-row gap-3">
							<OrderDetail label="Email" value={order.email} />
							<OrderDetail label="Phone" value={order.phone} />
						</div>
					</div>

					<div className="space-y-3 mb-10">
						<p className="font-semibold mb-2 text-orange-500">Order information</p>

						<OrderDetail label="Method" value={PrettyCase(order.method)} />

						{order.method === "delivery" && (
							<OrderDetail
								label="Delivery address"
								value={`${order.address_line2 ? order.address_line2 + "/" : ""}${order.address_line1}, ${order.suburb} ${order.state} ${order.postcode}`}
							/>
						)}

						{order.notes && (
							<OrderDetail label="Notes" value={order.notes} />
						)}
					</div>

					<div className="space-y-3 mb-10">
						<p className="font-semibold mb-2 text-orange-500">Payment information</p>
						<div className="w-full flex flex-col md:flex-row gap-3">
							<OrderDetail label="Payment method" value={PrettyCase(order.payment_type)} />
							<OrderDetail label="Payment status" value={PrettyCase(order.payment_status)} />
						</div>
					</div>
				</div>

				<div id="cart" className="w-full">
					<p className="text-orange-500 font-semibold mb-4">Your cart</p>
					<div className="w-full flex flex-col gap-4">
						{items.map(item => (
							<div key={item.id} className="border-b border-zinc-300 pb-4">
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
							<p>{money(order.subtotal_cents)}</p>
						</div>

						{order.method === "delivery" && (
							<div className="w-full flex justify-between items-center text-zinc-600 text-sm gap-4">
								<p>Delivery</p>
								<p>{money(order.delivery_cents)}</p>
							</div>
						)}

						{order.discount_cents > 0 && (
							<div className="w-full flex justify-between items-center text-zinc-600 text-sm gap-4">
								<p>Discount</p>
								<p>-{money(order.discount_cents)}</p>
							</div>
						)}

						<div className="w-full flex justify-between items-center font-semibold gap-4 text-lg mt-1 mb-4">
							<p>Total</p>
							<p>{money(order.total_cents)}</p>
						</div>
					</div>
				</div>
			</OrderSummary>

			<p className="text-zinc-600 mb-2">Your total is...</p>

			{!loading && (
				<>
					<Title text={money(order.total_cents)} />
					<button className="cursor-pointer text-zinc-600 text-sm underline mt-2 mb-8" onClick={() => {setShowOverlay(true); setShowOrder(true)}}>View order</button>
					<div className="w-full max-w-md">
						<Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: "stripe" } }}>
							<PayForm orderId={orderId} setMsg={setMsg} />
						</Elements>
					</div>
				</>
			)}
			
			{loading && (
				<>
					<div className="w-16 h-6 skeleton rounded-xl mb-8"></div>
					<div className="w-full max-w-md h-96 skeleton rounded-xl"></div>
				</>
			)}
			
		</Main>
  	);
}
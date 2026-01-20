"use client";

import React, { useState, useEffect } from "react";
import Main from "@/components/Main";
import type { CartResponse } from "@/types";
import { TrashIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { API, money } from "@/components/Functions";
import Title from "@/components/Text";
import { ButtonSolid } from "@/components/Buttons";
import Link from "next/link";

export default function CartPage() {
	const [cart, setCart] = useState<CartResponse>({ id: null, items: [], subtotal_cents: 0 });
	const [loading, setLoading] = useState(false);
	const [msg, setMsg] = useState<string | null>(null);

	async function loadCart() {
		if (!API) {
			setMsg("Missing NEXT_PUBLIC_BASE_API_URL!");
			return;
		}

		setLoading(true);
		setMsg(null);

		try {
			const res = await fetch(API + "cart", {
				cache: "no-store",
				credentials: "include"
			});

			if (!res.ok) {
				throw new Error(`GET /cart -> ${res.status}`);
			}

			const data = (await res.json()) as CartResponse;

			setCart(data);
		} catch (e: any) {
			setMsg(e.message || "Failed to load cart!");
		} finally {
			setLoading(false);
		}
	}

	async function patchQty(id: number, qty: number) {
		if (qty < 1) {
			return;
		}

		setLoading(true);
		setMsg(null);

		try {
			const res = await fetch(API + `cart/items/${id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ quantity: qty }),
				credentials: "include"
			});
			const data = await res.json().catch(() => null);

			if (!res.ok) {
				throw new Error(data?.error || `PATCH /cart/items/${id} -> ${res.status}`);
			}

			await loadCart();
		} catch (e: any) {
			setMsg(e.message || "Failed to update quantity!");
		} finally {
			setLoading(false);
		}
	}

	async function removeItem(id: number) {
		setLoading(true); setMsg(null);

		try {
			const res = await fetch(API + `cart/items/${id}`, {
				method: "DELETE",
				credentials: "include"
			});
			const data = await res.json().catch(() => null);

			if (!res.ok) {
				throw new Error(data?.error || `DELETE /cart/items/${id} -> ${res.status}`);
			}

			await loadCart();
		} catch (e: any) {
			setMsg(e.message || "Failed to delete item!");
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		loadCart();
	}, []);

	return (
		<>
			<Main>
				<Title text="Your cart" />
				{msg && (<p className="text-center text-zinc-600 mt-4 mb-8">{msg}</p>)}

				{cart.items.length === 0 && (
					<div className="w-full flex flex-col justify-center items-center gap-4 mt-4">
						<p className="text-center text-zinc-600">Your cart is empty. Visit our menu to add something to it!</p>

						<Link href="/menu">
							<ButtonSolid short={true} text="Go to Menu" />
						</Link>
					</div>
				)}

				{cart.items.length > 0 && (
					<div className="w-full max-w-4xl flex flex-col gap-6 mt-16">
						{cart.items.map(item => (
							<div key={item.id} className="w-full flex gap-3 pb-6 border-b border-zinc-300">
								<img src={item.image_url ?? "/pizza.svg"} className="h-16 aspect-1/1" />

								<div className="w-full text-sm">
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
												<p key={t.id}>- {t.name}</p>
											))}
										</div>
									)}

									<div className="mt-3 flex items-center justify-between">
										<div className="inline-flex items-center gap-1">
											<button onClick={() => patchQty(item.id, item.quantity - 1)} className={`${loading ? "text-zinc-300" : "text-zinc-600"}`}>
												<ChevronLeftIcon className="h-3 w-3 cursor-pointer" />
											</button>
											<span className="w-8 text-center text-sm">{item.quantity}</span>
											<button onClick={() => patchQty(item.id, item.quantity + 1)} className={`${loading ? "text-zinc-300" : "text-zinc-600"}`}>
												<ChevronRightIcon className="h-3 w-3 cursor-pointer" />
											</button>
										</div>
										<button onClick={() => removeItem(item.id)}>
											<TrashIcon className="h-5 w-5 text-red-500 cursor-pointer" />
										</button>
									</div>
								</div>
							</div>
						))}

						
						<div className="flex justify-between items-center gap-4">
							<p className="text-zinc-600">Subtotal</p>
							<p className="text-lg font-semibold">{money(cart.subtotal_cents)}</p>
						</div>

						<div className="w-full flex justify-end">
							<Link href="/checkout">
								<ButtonSolid short={true} text="Proceed to Checkout" />
							</Link>
						</div>
						
					</div>
				)}

			</Main>
		</>
	);
}

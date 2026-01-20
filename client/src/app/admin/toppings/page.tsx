"use client";

import React, { useState, useEffect } from "react";
import type { Topping } from "@/types";
import { API } from "@/components/Functions";
import Main from "@/components/Main";
import Title from "@/components/Text";
import Input from "@/components/Form";
import { CheckIcon, TrashIcon, PlusIcon, ArrowPathIcon } from "@heroicons/react/24/outline";

export default function AdminToppingsPage() {
	const [toppings, setToppings] = useState<Topping[]>([]);
	const [newName, setNewName] = useState("");
	const [newPrice, setNewPrice] = useState<string>("");
	const [loading, setLoading] = useState(false);
	const [msg, setMsg] = useState<string | null>(null);

	async function fetchToppings() {
		if (!API) {
			setMsg("Missing NEXT_PUBLIC_BASE_API_URL!");
			return;
		}

		setLoading(true);
		setMsg(null);

		try {
			const res = await fetch(API + "toppings", { cache: "no-store" });

			if (!res.ok) {
				throw new Error(`GET /toppings -> ${res.status}`);
			}

			const data = await res.json();

			setToppings(Array.isArray(data) ? data : []);
		} catch (e: any) {
			setMsg(e.message || "Failed to load toppings!");
		} finally {
			setLoading(false);
		}
	}

	async function addTopping() {
		const priceCents = parseInt(newPrice, 10);

		if (!newName.trim() || !Number.isInteger(priceCents) || priceCents < 0) {
			setMsg("Enter name and non-negative price (cents)!");
			return;
		}

		setLoading(true);
		setMsg(null);

		try {
			const res = await fetch(API + "admin/toppings", {
				method: "POST",
				headers: { "Content-Type": "application/json"},
				credentials: "include",
				body: JSON.stringify({ name: newName.trim(), priceCents })
			});

			const j = await res.json().catch(() => null);

			if (!res.ok) {
				throw new Error(j?.error || `POST /admin/toppings -> ${res.status}`);
			}

			setNewName("");
			setNewPrice("");
			await fetchToppings();
			setMsg("Topping added!");
		} catch (e: any) {
			setMsg(e.message || "Failed to add topping!");
		} finally {
			setLoading(false);
		}
	}

	async function saveTopping(id: number, data: { name: string; priceCents: number }) {
		setLoading(true);
		setMsg(null);

		try {
			const res = await fetch(API + `admin/toppings/${id}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json"},
				credentials: "include",
				body: JSON.stringify(data)
			});

			const j = await res.json().catch(() => null);

			if (!res.ok) {
				throw new Error(j?.error || `PUT /admin/toppings/${id} -> ${res.status}`);
			}

			await fetchToppings();
			setMsg("Topping saved!");
		} catch (e: any) {
			setMsg(e.message || "Failed to save topping!");
		} finally {
			setLoading(false);
		}
	}

	async function deleteTopping(id: number) {
		setLoading(true);
		setMsg(null);

		try {
			const res = await fetch(API + `admin/toppings/${id}`, {
				method: "DELETE",
				credentials: "include"
			});

			const j = await res.json().catch(() => null);

			if (!res.ok) {
				throw new Error(j?.error || `DELETE /admin/toppings/${id} -> ${res.status}`);
			}

			await fetchToppings();
			setMsg("Topping deleted!");
		} catch (e: any) {
			setMsg(e.message || "Failed to delete topping!");
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => { fetchToppings(); }, []);

	return (
		<Main>
			<div className="w-full flex flex-col justify-center items-center mb-16">
				<Title text="Toppings" />
				{msg && <p className="text-sm text-gray-600 mt-4">{msg}</p>}
			</div>

			<div className="w-full max-w-2xl mb-12">
				<p className="mb-2">Add a new topping</p>
				<div className="w-full flex flex-row justify-center items-center md:items-end gap-4">
					<div className="w-full flex flex-col md:flex-row justify-center items-center gap-4">
						<Input
							label="Sauce name"
							placeholder="e.g., Creme Fraiche"
							value={newName}
							onChange={e => setNewName(e.target.value)}
						/>
						<Input
							type="number"
							label="Price (cents)"
							placeholder="e.g., 150"
							value={newPrice}
							onChange={e => setNewPrice(e.target.value)}
						/>
					</div>
					<div className="flex flex-row justify-center items-center gap-2">
						<button
							onClick={addTopping}
							disabled={loading}
						>
							<PlusIcon
								className={`
									h-5 w-5 md:mb-[14px] cursor-pointer
									${loading ? "text-zinc-300" : "text-zinc-600"}
								`}
							/>
						</button>
					</div>
				</div>
			</div>
			
			<div className="w-full max-w-2xl">
				<div className="w-full flex items-center gap-3">
					<p className="mb-2">Current toppings</p>
					<button
							onClick={fetchToppings}
							disabled={loading}
					>
						<ArrowPathIcon
							className={`
								h-3 w-3 cursor-pointer mb-2
								${loading ? "text-zinc-300" : "text-zinc-600"}
							`}
						/>
					</button>
				</div>
				<div className="w-full flex flex-col gap-6">
					{toppings.map(t => (
						<ToppingRow
							key={t.id}
							topping={t}
							onSave={saveTopping}
							onDelete={deleteTopping}
						/>
					))}
				</div>
				{toppings.length === 0 && <p className="text-sm text-gray-600">You haven't added any toppings yet!</p>}
			</div>
			
		</Main>
    );
}

function ToppingRow({ topping, onSave, onDelete }: { topping: Topping; onSave: (id: number, d: { name: string; priceCents: number }) => Promise<void>; onDelete: (id: number) => Promise<void>; }) {
	const [name, setName] = useState(topping.name);
	const [price, setPrice] = useState(topping.price_cents);
	const [saving, setSaving] = useState(false);

	return (
		<div className="w-full">
			<p className="text-xs text-zinc-600 font-semibold mb-1">ID: {topping.id}</p>
			<div className="w-full flex flex-row justify-center items-center md:items-end gap-4">
				<div className="w-full flex flex-col md:flex-row justify-center items-center gap-4">
					<Input
						label="Topping name"
						placeholder="e.g., Pepperoni"
						value={name}
						onChange={e => setName(e.target.value)}
					/>
					<Input
						type="number"
						label="Price (cents)"
						placeholder="e.g., 150"
						value={price}
						onChange={e => setPrice(parseInt(e.target.value, 10) || 0)}
					/>
				</div>
				<div className="flex flex-row justify-center items-center gap-2">
					<button
						onClick={
							async () => {
								setSaving(true);
								await onSave(topping.id, { name: name.trim(), priceCents: Math.max(0, price) });
								setSaving(false);
							}
						}
						disabled={saving}
					>
						<CheckIcon
							className={`
								h-5 w-5 md:mb-[14px] cursor-pointer
								${saving ? "text-zinc-300" : "text-zinc-600"}
							`}
						/>
					</button>
					<button onClick={() => onDelete(topping.id)}>
						<TrashIcon
							className={`
								h-5 w-5 md:mb-[14px] cursor-pointer
								${saving ? "text-zinc-300" : "text-zinc-600"}
							`}
						/>
					</button>
				</div>
			</div>
		</div>
	);
}
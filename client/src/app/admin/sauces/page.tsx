"use client";

import React, { useState, useEffect } from "react";
import type { Sauce } from "@/types";
import { API } from "@/components/Functions";
import Main from "@/components/Main";
import Title from "@/components/Text";
import Input from "@/components/Form";
import { CheckIcon, TrashIcon, PlusIcon, ArrowPathIcon } from "@heroicons/react/24/outline";

export default function AdminSaucesPage() {
    const [sauces, setSauces] = useState<Sauce[]>([]);
    const [newName, setNewName] = useState("");
    const [newPrice, setNewPrice] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState<string | null>(null);

    async function fetchSauces() {
		if (!API) {
			setMsg("Missing NEXT_PUBLIC_BASE_API_URL!");
			return;
		}

		setLoading(true);
		setMsg(null);

		try {
			const res = await fetch(API + "sauces", { cache: "no-store" });

			if (!res.ok) {
				throw new Error(`GET /sauces -> ${res.status}`);
			}

			const data = await res.json();

			setSauces(Array.isArray(data) ? data : []);
		} catch (e: any) {
			setMsg(e.message || "Failed to load sauces!");
		} finally {
			setLoading(false);
		}
	}

    async function addSauce() {
		const priceCents = parseInt(newPrice, 10);

		if (!newName.trim() || !Number.isInteger(priceCents) || priceCents < 0) {
			setMsg("Enter name and non-negative price (cents)!");
			return;
		}

		setLoading(true);
		setMsg(null);

		try {
			const res = await fetch(API + "admin/sauces", {
				method: "POST",
				headers: { "Content-Type": "application/json"},
				credentials: "include",
				body: JSON.stringify({ name: newName.trim(), priceCents })
			});

			const j = await res.json().catch(() => null);

			if (!res.ok) {
				throw new Error(j?.error || `POST /admin/sauces -> ${res.status}`);
			}

			setNewName("");
			setNewPrice("");
			await fetchSauces();
			setMsg("Sauce added!");
		} catch (e: any) {
			setMsg(e.message || "Failed to add sauce!");
		} finally {
			setLoading(false);
		}
	}

    async function saveSauce(id: number, data: { name: string; priceCents: number }) {
		setLoading(true);
		setMsg(null);

		try {
			const res = await fetch(API + `admin/sauces/${id}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify(data)
			});

			const j = await res.json().catch(() => null);

			if (!res.ok) {
				throw new Error(j?.error || `PUT /admin/sauces/${id} -> ${res.status}`);
			}

			await fetchSauces();
			setMsg("Sauce saved!");
		} catch (e: any) {
			setMsg(e.message || "Failed to save sauce!");
		} finally {
			setLoading(false);
		}
	}

    async function deleteSauce(id: number) {
		setLoading(true);
		setMsg(null);

		try {
			const res = await fetch(API + `admin/sauces/${id}`, {
				method: "DELETE",
				credentials: "include"
			});

			const j = await res.json().catch(() => null);

			if (!res.ok) {
				throw new Error(j?.error || `DELETE /admin/sauces/${id} -> ${res.status}`);
			}

			await fetchSauces();
			setMsg("Sauce deleted!");
		} catch (e: any) {
			setMsg(e.message || "Failed to delete sauce!");
		} finally {
			setLoading(false);
		}
	}

    useEffect(() => { fetchSauces(); }, []);

    return (
		<Main>
			<div className="w-full flex flex-col justify-center items-center mb-16">
				<Title text="Sauces" />
				{msg && <p className="text-sm text-gray-600 mt-4">{msg}</p>}
			</div>

			<div className="w-full max-w-2xl mb-12">
				<p className="mb-2">Add a new sauce</p>
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
							onClick={addSauce}
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
					<p className="mb-2">Current sauces</p>
					<button
							onClick={fetchSauces}
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
					{sauces.map(s => (
						<SauceRow
							key={s.id}
							sauce={s}
							onSave={saveSauce}
							onDelete={deleteSauce}
						/>
					))}
				</div>
				{sauces.length === 0 && <p className="text-sm text-gray-600">You haven't added any sauces yet!</p>}
			</div>
			
		</Main>
    );
}

function SauceRow({ sauce, onSave, onDelete }: { sauce: Sauce; onSave: (id: number, d: { name: string; priceCents: number }) => Promise<void>; onDelete: (id: number) => Promise<void>; }) {
    const [name, setName] = useState(sauce.name);
    const [price, setPrice] = useState(sauce.price_cents);
    const [saving, setSaving] = useState(false);

    return (
		<div className="w-full">
			<p className="text-xs text-zinc-600 font-semibold mb-1">ID: {sauce.id}</p>
			<div className="w-full flex flex-row justify-center items-center md:items-end gap-4">
				<div className="w-full flex flex-col md:flex-row justify-center items-center gap-4">
					<Input
						label="Sauce name"
						placeholder="e.g., Creme Fraiche"
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
								await onSave(sauce.id, { name: name.trim(), priceCents: Math.max(0, price) });
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
					<button onClick={() => onDelete(sauce.id)}>
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

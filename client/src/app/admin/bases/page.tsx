"use client";

import React, { useState, useEffect } from "react";
import type { Base } from "@/types";
import { API } from "@/components/Functions";
import Main from "@/components/Main";
import Title from "@/components/Text";
import Input from "@/components/Form";
import { CheckIcon, TrashIcon, PlusIcon, ArrowPathIcon } from "@heroicons/react/24/outline";

export default function AdminBasesPage() {
	const [bases, setBases] = useState<Base[]>([]);
	const [newName, setNewName] = useState("");
	const [newPrice, setNewPrice] = useState<string>("");
	const [loading, setLoading] = useState(false);
	const [msg, setMsg] = useState<string | null>(null);

	async function fetchBases() {
		if (!API) {
			setMsg("Missing NEXT_PUBLIC_BASE_API_URL!");
			return;
		}

		setLoading(true);
		setMsg(null);

		try {
			const res = await fetch(API + "bases", { cache: "no-store" });

			if (!res.ok) {
				throw new Error(`GET /bases -> ${res.status}`);
			}

			const data = await res.json();

			setBases(Array.isArray(data) ? data : []);
		} catch (e: any) {
			setMsg(e.message || "Failed to load bases!");
		} finally {
			setLoading(false);
		}
	}

	async function addBase() {
		const priceCents = parseInt(newPrice, 10);

		if (!newName.trim() || !Number.isInteger(priceCents) || priceCents < 0) {
			setMsg("Enter name and non-negative price (cents)!");
			return;
		}

		setLoading(true);
		setMsg(null);

		try {
			const res = await fetch(API + "admin/bases", {
				method: "POST",
				headers: { "Content-Type": "application/json"},
				credentials: "include",
				body: JSON.stringify({ name: newName.trim(), priceCents })
			});

			const j = await res.json().catch(() => null);

			if (!res.ok) {
				throw new Error(j?.error || `POST /admin/bases -> ${res.status}`);
			}

			setNewName("");
			setNewPrice("");
			await fetchBases();
			setMsg("Base added!");
		} catch (e: any) {
			setMsg(e.message || "Failed to add base!");
		} finally {
			setLoading(false);
		}
	}

	async function saveBase(id: number, data: { name: string; priceCents: number }) {
		setLoading(true);
		setMsg(null);

		try {
			const res = await fetch(API + `admin/bases/${id}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json"},
				credentials: "include",
				body: JSON.stringify(data)
			});

			const j = await res.json().catch(() => null);

			if (!res.ok) {
				throw new Error(j?.error || `PUT /admin/bases/${id} -> ${res.status}`);
			}

			await fetchBases();
			setMsg("Base saved!");
		} catch (e: any) {
			setMsg(e.message || "Failed to save base!");
		} finally {
			setLoading(false);
		}
	}

	async function deleteBase(id: number) {
		setLoading(true);
		setMsg(null);

		try {
			const res = await fetch(API + `admin/bases/${id}`, {
				method: "DELETE",
				credentials: "include"
			});

			const j = await res.json().catch(() => null);

			if (!res.ok) {
				throw new Error(j?.error || `DELETE /admin/bases/${id} -> ${res.status}`);
			}

			await fetchBases();
			setMsg("Base deleted!");
		} catch (e: any) {
			setMsg(e.message || "Failed to delete base!");
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => { fetchBases(); }, []);

	return (
		<Main>
			<div className="w-full flex flex-col justify-center items-center mb-16">
				<Title text="Bases" />
				{msg && <p className="text-sm text-gray-600 mt-4">{msg}</p>}
			</div>

			<div className="w-full max-w-2xl mb-12">
				<p className="mb-2">Add a new base</p>
				<div className="w-full flex flex-row justify-center items-center md:items-end gap-4">
					<div className="w-full flex flex-col md:flex-row justify-center items-center gap-4">
						<Input
							label="Base name"
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
							onClick={addBase}
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
					<p className="mb-2">Current bases</p>
					<button
							onClick={fetchBases}
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
					{bases.map(t => (
						<BaseRow
							key={t.id}
							base={t}
							onSave={saveBase}
							onDelete={deleteBase}
						/>
					))}
				</div>
				{bases.length === 0 && <p className="text-sm text-gray-600">You haven't added any bases yet!</p>}
			</div>
			
		</Main>
    );
}

function BaseRow({ base, onSave, onDelete }: { base: Base; onSave: (id: number, d: { name: string; priceCents: number }) => Promise<void>; onDelete: (id: number) => Promise<void>; }) {
	const [name, setName] = useState(base.name);
	const [price, setPrice] = useState(base.price_cents);
	const [saving, setSaving] = useState(false);

	return (
		<div className="w-full">
			<p className="text-xs text-zinc-600 font-semibold mb-1">ID: {base.id}</p>
			<div className="w-full flex flex-row justify-center items-center md:items-end gap-4">
				<div className="w-full flex flex-col md:flex-row justify-center items-center gap-4">
					<Input
						label="Base name"
						placeholder="e.g., Gluten Free"
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
								await onSave(base.id, { name: name.trim(), priceCents: Math.max(0, price) });
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
					<button onClick={() => onDelete(base.id)}>
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
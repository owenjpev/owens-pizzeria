"use client";

import React, { useState, useEffect } from "react";
import type { Base, Sauce, Topping, PizzaFull } from "@/types";
import { API } from "@/components/Functions";
import Main from "@/components/Main";
import Title from "@/components/Text";
import Input, { Textarea, RadioGroup, CheckboxGroup } from "@/components/Form";
import Button, { ButtonSolid } from "@/components/Buttons";
import { CheckIcon, TrashIcon, PlusIcon, ArrowPathIcon, ArrowDownIcon } from "@heroicons/react/24/outline";
import { money } from "@/components/Functions";

export default function AdminPizzasPage() {
	const [loading, setLoading] = useState(false);
	const [msg, setMsg] = useState<string | null>(null);

	const [pizzas, setPizzas] = useState<PizzaFull[]>([]);
	const [bases, setBases] = useState<Base[]>([]);
	const [sauces, setSauces] = useState<Sauce[]>([]);
	const [toppings, setToppings] = useState<Topping[]>([]);

	const [name, setName] = useState("");
	const [desc, setDesc] = useState("");
	const [price, setPrice] = useState<string>("");
	const [imageUrl, setImageUrl] = useState("");
	const [baseId, setBaseId] = useState<number | "">("");
	const [sauceId, setSauceId] = useState<number | "">("");
	const [checkedToppings, setCheckedToppings] = useState<number[]>([]);

	async function loadAll() {
		if (!API) {
			setMsg("Missing NEXT_PUBLIC_BASE_API_URL!");
			return;
		}

		setLoading(true);
		setMsg(null);

		try {
			const [p,b,s,t] = await Promise.all([
				fetch(API + "pizzas", { cache: "no-store" }).then(r => r.json()),
				fetch(API + "bases", { cache: "no-store" }).then(r => r.json()),
				fetch(API + "sauces", { cache: "no-store" }).then(r => r.json()),
				fetch(API + "toppings", { cache: "no-store" }).then(r => r.json()),
			]);

			setPizzas(Array.isArray(p) ? p : []);
			setBases(Array.isArray(b) ? b : []);
			setSauces(Array.isArray(s) ? s : []);
			setToppings(Array.isArray(t) ? t : []);
		} catch (e: any) {
			setMsg(e.message || "Failed to load pizzas!");
		} finally {
			setLoading(false);
		}
	}

	function toggleTopping(id: number) {
		setCheckedToppings(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
	}

	async function createPizza() {
		const price_cents = parseInt(price,10);

		if (!name.trim()) {
			return setMsg("Name required!");
		}

		if (!Number.isInteger(price_cents) || price_cents < 0) {
			return setMsg("Price (cents) must be a non-negative integer!");
		}

		if (!Number.isInteger(baseId as number)) {
			return setMsg("Pick a base!");
		}

		if (!Number.isInteger(sauceId as number)) {
			return setMsg("Pick a sauce!");
		}

		if (!Array.isArray(checkedToppings)) {
			return setMsg("Toppings must be an array!");
		}

		setLoading(true);
		setMsg(null);

		try {
			const body = {
				name: name.trim(),
				description: desc.trim() || null,
				base_id: Number(baseId),
				sauce_id: Number(sauceId),
				topping_ids: checkedToppings,
				price_cents,
				image_url: imageUrl || null
			};

			const res = await fetch(API + "admin/pizzas", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(body),
				credentials: "include"
			});

			const j = await res.json().catch(() => null);

			if (!res.ok) {
				throw new Error(j?.error || `POST /admin/pizzas -> ${res.status}`);
			}

			setName("");
			setDesc("");
			setPrice("");
			setImageUrl("");
			setBaseId("");
			setSauceId("");
			setCheckedToppings([]);

			await loadAll();

			setMsg("Pizza created!");
		} catch (e: any) {
			setMsg(e.message || "Failed to create pizza!");
		} finally {
			setLoading(false);
		}
	}

	async function deletePizza(id: number) {
		setLoading(true);
		setMsg(null);

		try {
			const res = await fetch(API + `admin/pizzas/${id}`, {
				method: "DELETE",
				credentials: "include"
			});

			const j = await res.json().catch(() => null);

			if (!res.ok) {
				throw new Error(j?.error || `DELETE /admin/pizzas/${id} -> ${res.status}`);
			}

			await loadAll();

			setMsg("Pizza deleted!");
		} catch (e:any) {
			setMsg(e.message || "Failed to delete!");
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => { loadAll(); }, []);

	return (
		<Main>
			<div className="w-full flex flex-col justify-center items-center mb-16">
				<Title text="Create a new pizza" />
				{msg && <p className="text-sm text-gray-600 mt-4">{msg}</p>}
			</div>

			<div className="w-full mb-12">
				<div className="w-full flex flex-col md:flex-row justify-center items-start gap-8 md:gap-16">
					<div className="w-full flex flex-col justify-center items-start gap-4">
						<Input
							label="Name"
							placeholder="e.g., The Godfather"
							value={name}
							onChange={e => setName(e.target.value)}
						/>
						<Input
							type="number"
							label="Price (cents)"
							placeholder="e.g., 150"
							value={price}
							onChange={e => setPrice(e.target.value)}
						/>
						<Input
							label="Image URL"
							placeholder="e.g., https://www.image.com/pizza"
							value={imageUrl}
							onChange={e => setImageUrl(e.target.value)}
						/>
						<Textarea
							label="Description"
							placeholder="Write something here!"
							value={desc}
							onChange={e => setDesc(e.target.value)}
						/>
					</div>
					<div className="w-1/2 flex flex-col justify-center items-start gap-8">
						<RadioGroup
							label="Base"
							name="base"
							options={bases.map(b => ({
								label: `${b.name} ($${(b.price_cents / 100).toFixed(2)})`,
								value: b.id.toString(),
							}))}
							value={baseId === "" ? "" : String(baseId)}
							onChange={e => {
								const v = e.target.value;
								setBaseId(v === "" ? "" : parseInt(v, 10));
							}}
						/>

						<RadioGroup
							label="Sauce"
							name="sauce"
							options={sauces.map(s => ({
								label: `${s.name} ($${(s.price_cents / 100).toFixed(2)})`,
								value: s.id.toString(),
							}))}
							value={sauceId === "" ? "" : String(sauceId)}
							onChange={e => {
								const v = e.target.value;
								setSauceId(v === "" ? "" : parseInt(v, 10));
							}}
						/>

						<CheckboxGroup
							label="Toppings"
							name="toppings"
							options={toppings.map(t => ({
								label: `${t.name} ($${(t.price_cents / 100).toFixed(2)})`,
								value: t.id.toString(),
							}))}
							values={checkedToppings.map(id => id.toString())}
							onChange={(selected) => {
								setCheckedToppings(selected.map(v => parseInt(v, 10)));
							}}
						/>
					</div>
				</div>
				<div className="w-full flex flex-row justify-center items-center gap-2 mt-8">
					<ButtonSolid
						text="Create Pizza"
						short={true}
						onClick={createPizza}
						disabled={loading}
					>
					</ButtonSolid>
				</div>
			</div>
			<div className="w-full">
				<p className="font-semibold uppercase text-sm flex items-start gap-2">
					Current pizzas
					<button onClick={loadAll}>
						<ArrowPathIcon className="h-4 w-4" />
					</button>
				</p>
				<div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-12">
					{pizzas.map(p => (
						<div key={p.id} className="w-full flex flex-col justify-between items-center">
							<div>
								{p.image_url ? <img src={p.image_url} alt={p.name} className="w-full aspect-1/1 object-cover" /> : <div className="w-full aspect-1/1 rounded-t-xl bg-gray-200" />}
								<p className="font-semibold text-xl mb-2">{p.name}</p>
								<p className="text-sm text-zinc-600 mb-4">{p.description}</p>
								<div className="text-sm text-gray-700"><span className="font-medium">Base:</span> {p.base.name}</div>
								<div className="text-sm text-gray-700"><span className="font-medium">Sauce:</span> {p.sauce.name}</div>
								<div className="text-sm text-gray-700"><span className="font-medium">Toppings:</span> {p.toppings.length ? p.toppings.map(t => t.name).join(", ") : "None"}</div>
							</div>
							<div className="w-full flex justify-between items-center mt-4">
								<p className="font-semibold">From {money(p.price_cents)}</p>
								<button onClick={() => deletePizza(p.id)}>
									<TrashIcon
										className={`
											h-5 w-5 cursor-pointer
											${loading ? "text-red-300" : "text-red-600"}
										`}
									/>
								</button>
							</div>
						</div>
					))}
				</div>
			</div>
		</Main>
	);
}

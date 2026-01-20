"use client";

import React, { useState, useEffect, use } from "react";
import type { Base, Sauce, Topping, PizzaFull } from "@/types";
import { RadioGroup, CheckboxGroup } from "@/components/Form";
import Title from "@/components/Text";
import Main from "@/components/Main";
import { ButtonSolid } from "@/components/Buttons";
import { API } from "@/components/Functions";

export default function PizzaPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);

	const [pizza, setPizza] = useState<PizzaFull | null>(null);
	const [bases, setBases] = useState<Base[]>([]);
	const [sauces, setSauces] = useState<Sauce[]>([]);
	const [toppings, setToppings] = useState<Topping[]>([]);

	const [baseId, setBaseId] = useState<number | null>(null);
	const [sauceId, setSauceId] = useState<number | null>(null);
	const [selectedToppings, setSelectedToppings] = useState<string[]>([]);

	const [loading, setLoading] = useState(false);
	const [msg, setMsg] = useState<string | null>(null);

	async function load() {
		setLoading(true);
		setMsg(null);

		try {
			const [p, b, s, t] = await Promise.all([
				fetch(API + `pizzas/${id}`, { cache: "no-store" }).then(r => r.json()),
				fetch(API + "bases", { cache: "no-store" }).then(r => r.json()),
				fetch(API + "sauces", { cache: "no-store" }).then(r => r.json()),
				fetch(API + "toppings", { cache: "no-store" }).then(r => r.json())
			])
			setPizza(p)
			setBases(Array.isArray(b) ? b : [])
			setSauces(Array.isArray(s) ? s : [])
			setToppings(Array.isArray(t) ? t : [])
			setBaseId(p?.base?.id ?? null)
			setSauceId(p?.sauce?.id ?? null)
			setSelectedToppings((p?.toppings ?? []).map((x: Topping) => x.id.toString()))
		} catch (e: any) {
			setMsg(e.message || "Failed to load")
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		if (!API) {
			setMsg("Uh oh! It looks like something went wrong. Reason: Invalid API");
			return;
		}

		load();
	}, [API, id]);

	async function addToCart() {
		if (!pizza) return;

		if (!Number.isInteger(baseId as any)) return setMsg("Please pick a base!");
		if (!Number.isInteger(sauceId as any)) return setMsg("Please pick a sauce!");

		const preset = new Set<number>(pizza.toppings.map(t => t.id));
		const selected = new Set<number>(selectedToppings.map(Number));

		const added_topping_ids = Array.from(selected).filter(id => !preset.has(id));
		const removed_topping_ids = Array.from(preset).filter(id => !selected.has(id));

		const body = {
			pizza_id: pizza.id,
			base_id: Number(baseId),
			sauce_id: Number(sauceId),
			added_topping_ids,
			removed_topping_ids,
			quantity: 1
		}

		setLoading(true);
		setMsg(null);

		try {
			const res = await fetch(API + "cart/items", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(body),
				cache: "no-store",
				credentials: "include"
			});

			const data = await res.json().catch(() => null);

			if (!res.ok) {
				throw new Error(data?.error || `POST /cart/items -> ${res.status}`);
			}

			window.location.href = "/cart";
		} catch (e: any) {
			setMsg(e.message || "Failed to add to cart");
		} finally {
			setLoading(false)
		}
	}

	if (loading && !pizza) {
		return (
			<Main className="mx-auto max-w-4xl p-6"><p className="text-zinc-600">Loading…</p></Main>
		)
	}

	if (!pizza) {
		return (
			<Main className="mx-auto max-w-4xl p-6"><p className="text-red-600">Uh oh! Pizza not found!</p></Main>
		)
	}

	return (
		<>
			<Main>
				<div className="w-full flex flex-col md:flex-row justify-center items-start gap-16">
					<div className="w-full md:w-8/10">
						{pizza.image_url ? (
							<img src={pizza.image_url} alt={pizza.name} className="w-full aspect-1/1" />
						) : (
							<div className="w-full w-full rounded-lg skeleton sm:h-64" />
						)}
					</div>
					<div className="w-full">
						<Title text={pizza.name} className="text-left mb-6" />
						{pizza.description && <p className="text-zinc-600 mb-6">{pizza.description}</p>}

						<section className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
							<RadioGroup
								label="Base"
								name="base"
								options={bases.map(b => ({ label: `${b.name}  ($${(b.price_cents / 100).toFixed(2)})`, value: b.id.toString() }))}
								value={baseId?.toString() ?? ""}
								onChange={(e) => setBaseId(Number(e.target.value))}
							/>
							<RadioGroup
								label="Sauce"
								name="sauce"
								options={sauces.map(s => ({ label: `${s.name}  ($${(s.price_cents / 100).toFixed(2)})`, value: s.id.toString() }))}
								value={sauceId?.toString() ?? ""}
								onChange={(e) => setSauceId(Number(e.target.value))}
							/>
							<CheckboxGroup
								condensed={true}
								label="Toppings"
								name="toppings"
								options={toppings.map(t => ({ label: `${t.name}  ($${(t.price_cents / 100).toFixed(2)})`, value: t.id.toString() }))}
								values={selectedToppings}
								onChange={(v) => setSelectedToppings(v)}
							/>
						</section>

						<ButtonSolid
							thick={true}
							text={`Add to cart`}
							onClick={addToCart}
							disabled={loading}
						/>
					</div>
				</div>
			</Main>
		</>
	);
}
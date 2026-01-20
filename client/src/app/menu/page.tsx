"use client";

import React, { useState, useEffect } from "react";
import Main from "@/components/Main";
import Link from "next/link";
import Button from "@/components/Buttons";
import Title from "@/components/Text";
import { API, money } from "@/components/Functions";
import type { PizzaFull } from "@/types";

export default function MenuPage() {
	const [pizzas, setPizzas] = useState<PizzaFull[]>([]);
	const [loading, setLoading] = useState(false);
	const [msg, setMsg] = useState<string | null>(null)
	const [error, setError] = useState<string | null>(null)

	const showSkeleton = loading && pizzas.length === 0;

	async function getPizzas() {
		setLoading(true);

		try {
			const res = await fetch(API + "pizzas", { cache: "no-store" });
			const data = await res.json();

			if (!res.ok) {
                setError(data.error || "Uh oh! Something went wrong...");
                setLoading(false);
                return;
            }

			if (data.length === 0) {
				setMsg("Hmm, it looks like there are no pizzas available...")
			}

			setPizzas(data);
		} catch (e: any) {
			setError(e.error || "Uh oh! It looks like something went wrong...");
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		getPizzas();
	}, [])

    return (
		<Main>
			<Title text="Our Menu" />

			{msg && (
				<p className="text-zinc-600 mt-4 mb-4 text-center">{msg}</p>
			)}

			{error && (
				<p className="text-red-600 mt-4 mb-4 text-center">{error}</p>
			)}

			{!showSkeleton && (
				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-12 mt-16">
					{pizzas.map(p => (
						<Link href={`/pizzas/${p.id}`} key={p.id} className="w-full flex flex-col justify-between items-center cursor-pointer">
							<div>
								{p.image_url ? <img src={p.image_url} alt={p.name} className="w-full aspect-1/1 object-cover" /> : <div className="w-full aspect-1/1 rounded-t-xl bg-gray-200" />}
								<p className="font-semibold text-xl mb-2">{p.name}</p>
								<p className="text-sm text-zinc-600 mb-4">{p.description}</p>
							</div>
							<div className="w-full flex justify-between items-center">
								<p className="font-semibold">From {money(p.price_cents)}</p>
								<Button short={true} text="Customise" />
							</div>
						</Link>
					))}
				</div>
			)}
			
			{showSkeleton && (
				<div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-12 mt-24">
					{Array.from({ length: 4 }).map((_, i) => (
						<div key={i} className="w-full flex flex-col justify-between items-center">
							<div className="w-full">
								<div className="skeleton w-full aspect-1/1 rounded-t-xl" />

								<div className="skeleton h-6 w-3/4 mt-4 rounded" />
								<div className="skeleton h-4 w-full mt-2 rounded" />
							</div>

							<div className="w-full flex justify-between items-center mt-6">
								<div className="skeleton h-5 w-20 rounded" />
								<div className="skeleton h-8 w-24 rounded" />
							</div>
						</div>
					))}
				</div>
			)}
		</Main>
    );
}

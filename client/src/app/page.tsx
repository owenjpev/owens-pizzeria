"use client";

import React, { useEffect, useState } from "react"
import { IndexMain, Section } from "@/components/Main"
import type { PizzaFull } from "@/types";
import { API, money } from "@/components/Functions";
import Link from "next/link";
import Button from "@/components/Buttons";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { StarIcon } from "@heroicons/react/24/solid";

function Stars({ value }: { value: number }) {
    return (
        <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
                <StarIcon
                key={i}
                className={`h-5 w-5 ${
                    i < value ? "text-yellow-500" : "text-zinc-300"
                }`}
                />
            ))}
        </div>
    );
}

export default function HomePage() {
    const title = "The Tastiest Pizza in Australia.";
    const subtitle = "Hand-stretched dough, bold sauces, and toppings prepped fresh every morning. Blistered crusts, melty cheese, and flavor that hits different.";

    const reasons = [
        {
            title: "Stone-Fired Flavor",
            desc: "Our pies bake in a 700° stone oven for blistered crusts, melty cheese, and that legit pizzeria char.",
            img: "/fire.svg"
        },
        {
            title: "Built Your Way",
            desc: "Start with any base and sauce, then add or remove toppings to nail your exact vibe.",
            img: "/pizza.svg"
        },
        {
            title: "Fresh, Never Fussy",
            desc: "Dough made daily, produce prepped each morning, and orders out fast so it hits your table hot.",
            img: "/plate.svg"
        }
    ];
    
    const reviews = [
        {
            name: "Carol M.",
            date: "02/01/2026",
            description: "Crust was insane. Proper crispy edges and the toppings were stacked",
            stars: 5
        },
        {
            name: "Jack D.",
            date: "03/01/2026",
            description: "Fast checkout, easy to customize, and super tasty pizza!",
            stars: 5
        },
        {
            name: "george r.",
            date: "05/01/2026",
            description: "the ui feels like a real app. and the pizza is good too!",
            stars: 4
        },
        {
            name: "Mark J.",
            date: "02/01/2026",
            description: "Would rate 6 stars if I could!",
            stars: 5
        },
        {
            name: "adam p.",
            date: "03/01/2026",
            description: "good quality, will come back again",
            stars: 4
        },
        {
            name: "Michael B.",
            date: "05/01/2026",
            description: "Fast delivery and quality service!",
            stars: 5
        },
    ]

    const [pizzas, setPizzas] = useState<PizzaFull[]>([]);
    const [loading, setLoading] = useState(false);
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
                setError("Hmm, it looks like there are no pizzas available...")
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
        <IndexMain>
            <section className="w-full h-128 md:h-156 relative flex justify-center items-center px-6 bg-gradient-to-br from-orange-300 to-orange-400 overflow-hidden">
                <div className="w-full max-w-7xl h-full relative flex flex-col md:flex-row justify-between items-center gap-16">
                    <div
                        className={`
                            w-full md:max-w-2/5 z-2 absolute top-[calc(50%-24px)] left-1/2 -translate-x-1/2 -translate-y-1/2
                            md:relative md:top-0 md:left-0 md:-translate-x-0 md:-translate-y-0
                        `}
                    >
                        <h1 className="font-bold text-5xl md:text-6xl mb-6 font-title text-center md:text-left title-text-shadow text-white">{title}</h1>
                        <p className="text-center md:text-left title-text-shadow text-white hidden md:block">{subtitle}</p>
                        <div className="w-full flex justify-center md:justify-start">
                            <Link href="/menu" className="px-8 py-3 rounded-full bg-white shadow-lg text-orange-500 font-semibold flex gap-2 items-center md:mt-4">
                                See menu
                                <ArrowRightIcon className="h-5 w-5" />
                            </Link>
                        </div>
                    </div>
                    <img src="/index.png" className="absolute h-96 md:h-148 object-cover right-0 bottom-0 z-1 md:blur-none" />
                </div>
            </section>

            <Section>
                <h2 className="w-full text-3xl text-center font-bold mb-20">Why Choose Owen's Pizza?</h2>
                <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-16">
                    {reasons.map(reason => (
                        <div className="flex flex-col justify-center items-center" key={reason.title}>
                            <img src={reason.img} className="h-24 w-24 mb-4" />
                            <h3 className="font-bold mb-2 text-xl text-center">{reason.title}</h3>
                            <p className="text-zinc-500 text-center">{reason.desc}</p>
                        </div>
                    ))}
                </div>
            </Section>

            <div className="w-full max-w-4/5 border-t border-zinc-300"></div>

            <Section>
                <h2 className="w-full text-3xl text-center font-bold mb-20">Our Popular Picks!</h2>
                {!showSkeleton && (
                    <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-32">
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
                        {Array.from({ length: 3 }).map((_, i) => (
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
                <div className="w-full flex justify-end mt-8">
                    <Link href="/menu" className="flex justify-center items-center gap-2 text-orange-500">
                        Check out our menu
                        <ArrowRightIcon className="h-5 w-5" />
                    </Link>
                </div>
            </Section>

            <div className="w-full max-w-4/5 border-t border-zinc-300"></div>

            <Section>
                <h2 className="w-full text-3xl text-center font-bold mb-20 leading-12">Still Not Convinced?<br />Let's Ask The Audience.</h2>
                <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6">
                    {reviews.map(review => (
                        <div className="flex flex-col justify-start items-start border border-zinc-300 p-4 rounded-xl" key={review.name}>
                            <div className="w-full flex justify-between items-center">
                                <h3 className="text-lg font-semibold">{review.name}</h3>
                                <div className="text-lg font-semibold">
                                    <Stars value={review.stars} />
                                </div>
                            </div>
                            <p className="mb-2 text-xs text-center text-zinc-500">{review.date}</p>
                            <p className="text-zinc-700">{review.description}</p>
                        </div>
                    ))}
                </div>
            </Section>
            
        </IndexMain>
    );
}
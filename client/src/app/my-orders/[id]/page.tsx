"use client";

import React, { useEffect, useState } from "react";
import Main from "@/components/Main";
import { useParams } from "next/navigation";
import Title from "@/components/Text";
import { OrderDetail } from "@/components/Misc";
import type { Order, Item } from "@/types"
import { PrettyCase, API, money } from "@/components/Functions";

export default function OrderDetailsPage() {
    const params = useParams();
    const id = params?.id as string;

    const [order, setOrder] = useState<Order | null>(null);
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    async function load() {
        try {
            const res = await fetch(API + `my-orders/${id}`, {
                cache: "no-store",
                credentials: "include"
            });
            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Failed to load order");
                setLoading(false);
                return;
            }

            setOrder(data.order);
            setItems(data.items);
        } catch {
            setError("Something went wrong");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
    }, [id]);

    {/* These loading, error, and !order components aren't finished yet, but this will have to do for now! */}

    if (loading) {
        return (
            <Main>
                <div className="text-center text-zinc-600">Loading…</div>
            </Main>
        )
    }

    if (error || !order) {
        return (
            <Main>
                <p className="text-center text-red-500">{error || "Order not found!"}</p>
            </Main>
        )
    }

    return (
        <>
            <Main>
                <Title text="Your order" className="mb-16" />

                <div className="w-full max-w-5xl flex flex-col md:flex-row gap-12 md:gap-6">
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
                                <div className="border-b border-zinc-300 pb-4" key={item.id}>
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
                </div>

            </Main>
        </>
    );
}
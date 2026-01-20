"use client";

import React, { useEffect, useState } from "react";
import Main from "@/components/Main";
import Link from "next/link";
import { OrderPreview } from "@/types";
import { API } from "@/components/Functions";
import Title from "@/components/Text";

export default function MyOrdersPage() {
    const [orders, setOrders] = useState<OrderPreview[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    async function load() {
        try {
            const res = await fetch(API + "my-orders", {
                cache: "no-store",
                credentials: "include"
            });
            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Failed to load orders!");
                setLoading(false);
                return;
            }

            setOrders(data.orders || []);
        } catch {
            setError("Uh oh! Something went wrong...");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
    }, [])

    return (
        <Main>
            <div className="mb-16">
                <Title text="My Orders" className="mb-2" />

                <p className="text-red-600 text-center">*This page is not finished yet, front-end needs work</p>

                {loading && <p className="text-red-600">Loading…</p>}
                {error && <p className="text-red-600">{error}</p>}
                {!loading && !error && orders.length === 0 && (
                    <p className="text-zinc-600 text-sm">You haven’t placed any orders yet.</p>
                )}
            </div>

            <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {orders.map(o => (
                    <Link key={o.id} href={`/my-orders/${o.id}`} className="block">
                        <div className="border border-zinc-500 rounded-2xl p-4 hover:border-orange-500 transition-colors duration-500 flex flex-col gap-1">
                            <div className="text-sm text-zinc-500">Order ID: {o.id}</div>
                            <div className="font-medium">
                                Total: ${(o.total_cents / 100).toFixed(2)}
                            </div>
                            <div className="text-sm">Method: {o.method}</div>
                            <div className="text-sm">Placed: {new Date(o.created_at).toLocaleString()}</div>
                            <div className="text-sm">Payment: {o.payment_status}</div>
                        </div>
                    </Link>
                ))}
            </div>
        </Main>
    )
}

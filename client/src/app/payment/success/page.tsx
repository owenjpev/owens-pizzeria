import React from "react";
import Main from "@/components/Main";
import Link from "next/link";

export default function PaymentSuccessPage() {
    return (
        <Main>
            <img src="/tick.svg" className="w-32 h32 mb-8" />

            <h1 className="text-3xl font-semibold mb-4">Payment successful!</h1>
            <p className="text-zinc-600 w-full max-w-md text-center">
                Your order has been received and is now being prepared. You'll find all the details in your <Link href="/my-orders" className="font-semibold text-zinc-700 underline px-1">My Orders</Link> page. If you have any questions, feel free to contact us!
            </p>
        </Main>
    );
}
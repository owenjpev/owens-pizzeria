import React from "react";
import Main from "@/components/Main";
import Link from "next/link";
import { ButtonSolid } from "@/components/Buttons";

export default function PaymentSuccessPage() {
    return (
        <Main>
            <img src="/cross.svg" className="w-32 h32 mb-8" />

            <h1 className="text-3xl font-semibold mb-4">Payment failed!</h1>
            <p className="text-zinc-600 w-full max-w-md text-center mb-4">
                Something went wrong and we couldn't process your payment. No charges were made. Please try again, or update your payment method and continue when you're ready.
            </p>

            <Link href="/"><ButtonSolid text="Back home" /></Link>
        </Main>
    );
}
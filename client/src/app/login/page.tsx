"use client";

import React, { useState } from "react";
import Main from "@/components/Main";
import Input from "@/components/Form";
import Link from "next/link";
import { ButtonSolid } from "@/components/Buttons";
import { API } from "@/components/Functions";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function login() {
        setLoading(true);

        try {
            const res = await fetch(API + "login", {
                method: "POST",
                headers: { "Content-Type": "application/json", },
                credentials: "include",
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Uh oh! Something went wrong...");
                setLoading(false);
                return;
            }

            window.location.href = data.redirectLink;
        } catch (e: any) {
            setError(e.error || "Uh oh! Something went wrong...");
            setLoading(false);
        }
    }

    return (
        <Main>
            <img src="/chef.svg" className="w-32 h-32 mb-4" />
            <h1 className="text-center text-3xl font-bold mb-1">Welcome back!</h1>
            <p className="text-center text-sm text-zinc-500 mb-6">Log into your pizza account</p>

            {error && <div className="text-center text-red-600 mb-4">{error}</div>}

            <div className="w-full max-w-sm flex flex-col gap-4 mt-2 mb-4">
                <Input label="Email" name="email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
                <Input label="Password" name="password" type="password" value={password} onChange={e => setPassword(e.target.value)} />

                <ButtonSolid
                    text={loading ? "Logging in..." : "Login"}
                    onClick={login}
                    disabled={loading}
                />
            </div>
            
            <p className="text-zinc-600 text-sm">Don't have an account? <Link href="/signup" className="underline">Sign up</Link> here!</p>
        </Main>
    );
}

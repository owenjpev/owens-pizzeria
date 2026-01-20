"use client";

import React, { useState } from "react";
import Main from "@/components/Main";
import Input from "@/components/Form";
import Link from "next/link";
import { ButtonSolid } from "@/components/Buttons";
import { API } from "@/components/Functions";

export default function SignupPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [password2, setPassword2] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    async function signup() {
        if (password !== password2) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch(API + "users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || "Uh oh! Something went wrong...");
                setLoading(false);
                return;
            }

            setSuccess("Account created! You can now log in");
        } catch (e: any) {
            setError(e.error || "Uh oh! Something went wrong...");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Main>
            <img src="/chef2.svg" className="w-32 h-32 mb-4" />
            <h1 className="text-center text-3xl font-bold mb-1">We're glad to have you!</h1>
            <p className="text-center text-sm text-zinc-500 mb-6">Create your pizza account here</p>

            {error && <div className="text-center text-red-600 mb-4">{error}</div>}
            {success && <div className="text-center text-green-600 mb-4">{success}</div>}

            <div className="w-full max-w-sm flex flex-col gap-4 mt-2 mb-4">
                <Input label="Email" name="email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
                <Input label="Password" name="password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
                <Input label="Password" name="password" type="password" value={password} onChange={e => setPassword2(e.target.value)} />

                <ButtonSolid
                    text={loading ? "Logging in..." : "Login"}
                    onClick={signup}
                    disabled={loading}
                />
            </div>

            <p className="text-zinc-600 text-sm">Already have an account? <Link href="/login" className="underline">Log in</Link> here!</p>
        </Main>
    );
}

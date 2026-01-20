"use client";

import React, { useState } from "react";
import Main from "@/components/Main";
import Input from "@/components/Form";
import { API } from "@/components/Functions";
import Title from "@/components/Text";
import { ButtonSolid } from "@/components/Buttons";

export default function AdminCreateAdminsPage() {
    const [email, setEmail] = useState("")
    const [newPass, setNewPass] = useState("")
    const [loading, setLoading] = useState(false)
    const [msg, setMsg] = useState<string | null>(null)

    async function createAdmin() {
        setMsg(null);

        if (!email.trim() || !newPass.trim()) {
            setMsg("Missing email or password!")
            return
        }

        if (newPass.length < 6) {
            setMsg("Password must be at least 6 characters!")
            return
        }

        if (!API) {
            setMsg("Missing NEXT_PUBLIC_BASE_API_URL!")
            return
        }

        setLoading(true);

        try {
            const res = await fetch(API + "admin/admins", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email.trim(), password: newPass.trim() })
            });
            const data = await res.json().catch(() => null)

            if (!res.ok) {
                throw new Error(data?.error || "Failed to create admin!");
            }

            setEmail("");
            setNewPass("");

            setMsg("Admin created successfully! You can now try logging in");
        } catch (e: any) {
            setMsg(e.message || "Uh oh! Something went wrong...");
        } finally {
            setLoading(false)
        }
    }

    return (
        <Main>
            <div className="mb-16">
                <Title text="Create Admin" />
                {msg && <p className="text-sm text-gray-700">{msg}</p>}
            </div>

            <div className="w-full max-w-xs flex flex-col gap-3">
                <Input
                    label="Email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                />
                <Input
                    label="Password"
                    name="newPass"
                    type="password"
                    value={newPass}
                    onChange={e => setNewPass(e.target.value)}
                />

                <ButtonSolid
                    disabled={loading}
                    onClick={createAdmin}
                    text={loading ? "Creating..." : "Create Admin"}
                />
            </div>
        </Main>
    )
}

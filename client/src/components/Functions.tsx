import React from "react"

export const ensureSlash = (u?: string) => (u ? (u.endsWith("/") ? u : u + "/") : "");
export const PrettyCase = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
export const money = (cents: number) => `$${(cents / 100).toFixed(2)}`;
export const API = ensureSlash(process.env.NEXT_PUBLIC_BASE_API_URL);
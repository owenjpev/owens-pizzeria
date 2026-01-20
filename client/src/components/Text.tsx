import React from "react"

interface TextProps {
    text: string
    className?: string
}

export default function Title({ text, className }: TextProps) {
    return (
        <h1 className={`text-center text-4xl md:text-5xl font-bold font-title ${className ?? ""}`}>{text}</h1>
    )
}
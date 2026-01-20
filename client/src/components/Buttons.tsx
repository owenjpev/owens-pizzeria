import React from "react";

interface ButtonProps {
    text: string;
    short?: boolean
    thick?: boolean
    type?: "button" | "submit" | "reset"
    className?: string
    disabled?: boolean
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

export default function Button({ text, short, thick, className, disabled, type = "button", onClick }: ButtonProps) {
    return (
        <button
            className={`
                ${short ?? "w-full"}
                ${thick ? "py-3 px-8" : "py-2 px-6"}
                ${className ?? ""}
                rounded-full text-orange-400 font-semibold bg-orange-400/15 hover:bg-orange-400/25 transition-colors duration-300 cursor-pointer
            `}
            onClick={onClick}
            type={type}
            disabled={disabled}
        >
            {text}
        </button>
    );
}

export function ButtonSolid({ text, short, thick, className, disabled, type = "button", onClick }: ButtonProps) {
    return (
        <button
            className={`
                ${short ?? "w-full"}
                ${thick ? "py-3 px-8" : "py-2 px-6"}
                ${className ?? ""}
                rounded-full text-white font-semibold bg-orange-500 hover:bg-orange-600 transition-colors duration-300 cursor-pointer
            `}
            disabled={disabled}
            onClick={onClick}
            type={type}
        >
            {text}
        </button>
    );
}
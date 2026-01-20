import React, { ReactNode } from "react"

interface OverlayProps {
    showOverlay?: boolean;
    onClick: React.MouseEventHandler<HTMLButtonElement>;
}

interface PopupProps {
    showPopup?: boolean;
    className?: string
    children: ReactNode;
}

interface OrderProps {
    showOrder?: boolean;
    className?: string
    children: ReactNode;
}

export default function Overlay({ showOverlay, onClick }: OverlayProps) {
    return (
        <button onClick={onClick} className={`
            fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-screen h-screen
            transition-opacity duration-300 z-100 bg-black/50
            ${showOverlay ? "opacity-100 pointer-events-all" : "opacity-0 pointer-events-none"}
        `}></button>
    )
}

export function Popup({ showPopup, className, children }: PopupProps) {
    return (
        <div className={`
            w-full ${className ?? ""} bg-white rounded-2xl p-6
            fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
            transition-opacity duration-300 z-101
            ${showPopup ? "opacity-100 pointer-events-all" : "opacity-0 pointer-events-none"}
        `}>
            {children}
        </div>
    )
}

export function OrderSummary({ showOrder, className, children }: OrderProps) {
    return (
        <div
            className={`
                fixed top-0 z-101
                w-screen h-screen            /* full screen on mobile */
                overflow-y-auto              /* allow scrolling */
                md:w-full md:max-w-5xl
                md:h-auto md:max-h-[90vh]    /* prevent desktop overflow */
                md:overflow-y-auto           /* scroll on desktop if needed */
                
                flex flex-col md:flex-row gap-12 md:gap-6
                bg-white md:rounded-2xl p-6
                md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2
                transition-all duration-300
                ${showOrder ? "left-0 md:opacity-100 pointer-events-all" : "-left-10/9 md:opacity-0 pointer-events-none"}
                ${className ?? ""}
            `}
        >
            {children}
        </div>
    );
}


export function OrderDetail({ label, value }: { label: string, value: any }) {
    return (
        <div className="w-full">
            <p className="text-xs text-zinc-600">{label}</p>
            <p>{value}</p>
        </div>
    )
}
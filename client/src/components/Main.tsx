import React, { ReactNode } from "react"
import Header from "@/components/Header"
import Footer from "@/components/Footer";

interface MainProps {
    children: ReactNode;
    className?: string
    noPadding?: boolean
}

export default function Main({ children, className, noPadding }: MainProps) {
    return (
        <>
            <Header />
            <main className={`w-full min-h-[calc(100vh-96px)] flex flex-col justify-center items-center ${className ?? ""} ${noPadding ? "" : "px-6 py-8"}`}>
                <div className="w-full max-w-7xl flex flex-col justify-center items-center">
                    {children}
                </div>
            </main>
            <Footer />
        </>
    )
}

export function IndexMain({ children, noPadding }: MainProps) {
    return (
        <>
            <Header />
            <main className={`w-full min-h-[calc(100vh-96px)] flex flex-col justify-center items-center`}>
                {children}
            </main>
            <Footer />
        </>
    )
}

export function Section({ children, noPadding }: MainProps) {
    return (
       <section className={`w-full flex flex-col justify-center items-center px-6 py-24`}>
            <div className="w-full max-w-7xl flex flex-col justify-center items-center">
                {children}
            </div>
        </section>
    )
}
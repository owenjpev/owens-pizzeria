"use client";

import React, { useState } from "react";
import { ShoppingCartIcon, UserCircleIcon, Bars3Icon, HomeIcon, BookOpenIcon, InformationCircleIcon, ChatBubbleLeftIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import Overlay from "@/components/Misc";

export default function Header() {
    const [showOverlay, setShowOverlay] = useState(false);

    return (
        <>
            <Overlay showOverlay={showOverlay} onClick={() => setShowOverlay(false)} />
            <header className="w-full h-24 flex justify-center items-center px-6">
                <div className="w-full max-w-7xl grid grid-cols-2 md:grid-cols-3">
                    <div id="logo">
                        <Link href="/" className="text-orange-500 text-xl font-bold">Owen's Pizzeria</Link>
                    </div>
                    <div id="links" className="w-full hidden md:flex justify-center items-center gap-12">
                        <Link href="/" className="hover:text-orange-500 transition-colors duration-300">Home</Link>
                        <Link href="/menu" className="hover:text-orange-500 transition-colors duration-300">Menu</Link>
                        <Link href="/faq" className="hover:text-orange-500 transition-colors duration-300">FAQ</Link>
                        <Link href="/contact" className="hover:text-orange-500 transition-colors duration-300">Contact</Link>
                    </div>
                    <div id="icons" className="w-full hidden md:flex justify-end items-center gap-6">
                        <Link href="/cart"><ShoppingCartIcon className="h-6 w-6" /></Link>
                        <Link href="/login"><UserCircleIcon className="h-6 w-6" /></Link>
                    </div>
                    <div className="w-full flex justify-end items-center md:hidden">
                        <button onClick={() => setShowOverlay(true)}>
                            <Bars3Icon className="h-6 w-6" />
                        </button>
                    </div>
                </div>
            </header>
            <nav className={`
                w-64 h-screen fixed bg-white p-6
                ${showOverlay ? "left-0" : "-left-64"} top-0 transition-left duration-300 z-102
            `}>
                <div className="w-full">
                    <Link href="/" className="text-orange-500 text-xl font-bold">Owen's Pizzeria</Link>
                    <div className="w-full mt-16 flex flex-col justify-center items-center gap-4">
                        <Link href="/" className="w-full flex justify-start items-center gap-2 hover:text-orange-500 transition-colors duration-300">
                            <HomeIcon className="h-6 w-6" />
                            <p>Home</p>
                        </Link>
                        <Link href="/menu" className="w-full flex justify-start items-center gap-2 hover:text-orange-500 transition-colors duration-300">
                            <BookOpenIcon className="h-6 w-6" />
                            <p>Menu</p>
                        </Link>
                        <Link href="/faq" className="w-full flex justify-start items-center gap-2 hover:text-orange-500 transition-colors duration-300">
                            <InformationCircleIcon className="h-6 w-6" />
                            <p>FAQ</p>
                        </Link>
                        <Link href="/contact" className="w-full flex justify-start items-center gap-2 hover:text-orange-500 transition-colors duration-300">
                            <ChatBubbleLeftIcon className="h-6 w-6" />
                            <p>Contact</p>
                        </Link>
                    </div>
                    <div className="w-full mt-16 flex flex-col justify-center items-center gap-4">
                        <Link href="/cart" className="w-full flex justify-start items-center gap-2 hover:text-orange-500 transition-colors duration-300">
                            <ShoppingCartIcon className="h-6 w-6" />
                            <p>Cart</p>
                        </Link>
                        <Link href="/login" className="w-full flex justify-start items-center gap-2 hover:text-orange-500 transition-colors duration-300">
                            <UserCircleIcon className="h-6 w-6" />
                            <p>Login / Signup</p>
                        </Link>
                    </div>
                </div>
            </nav>
        </>
    )
}
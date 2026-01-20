import React, { ReactNode } from "react";
import Main from "@/components/Main";
import Link from "next/link";
import Title from "@/components/Text";
import { PencilSquareIcon } from "@heroicons/react/24/outline";

function AdminButton({ link, text, icon }: { link: string, text: string, icon: ReactNode }) {
    return (
        <Link
            href={link}
            className="border border-zinc-500 hover:border-orange-500 transition-colors duration-500
            p-6 flex flex-col justify-center items-center gap-4
            rounded-2xl text-lg text-center"
        >
            {icon}
            {text}
        </Link>
    );
}

export default function AdminPage() {
    return (
        <Main>
            <Title text="Welcome back!" className="mb-16" />
            <p className="text-zinc-600 mb-8">Where would you like to go?</p>
            <div className="w-full max-w-md grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <AdminButton link="/admin/bases" text="Edit Bases" icon={<PencilSquareIcon className="h-7 w-7" />} />
                <AdminButton link="/admin/sauces" text="Edit Sauces" icon={<PencilSquareIcon className="h-7 w-7" />} />
                <AdminButton link="/admin/toppings" text="Edit Toppings" icon={<PencilSquareIcon className="h-7 w-7" />} />
                <AdminButton link="/admin/pizzas" text="Edit Pizzas" icon={<PencilSquareIcon className="h-7 w-7" />} />
            </div>
            <Link href="/admin/admins" className="underline text-sm text-zinc-600">Create an admin account</Link>
        </Main>
    );
}
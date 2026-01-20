"use client";

import React, { ReactNode } from "react";
import Main from "@/components/Main";
import { EnvelopeOpenIcon, PhoneIcon, MapPinIcon, CalendarIcon } from "@heroicons/react/24/outline";

function ContactOption({ icon, text }: { icon: ReactNode, text: string }) {
    return (
        <div className="w-full flex justify-center md:justify-start items-center gap-2 text-zinc-700 mb-2">
            {icon}
            {text}
        </div>
    )
}

const hours = [
    { day: "Monday", start: "9AM", finish: "5PM" },
    { day: "Tuesday", start: "9AM", finish: "5PM" },
    { day: "Wednesday", start: "9AM", finish: "5PM" },
    { day: "Thursday", start: "9AM", finish: "5PM" },
    { day: "Friday", start: "9AM", finish: "5PM" },
    { day: "Saturday", start: "9AM", finish: "5PM" },
    { day: "Sunday", start: "10AM", finish: "5PM" }
]

export default function LoginPage() {
    return (
        <Main>
            <div className="w-full max-w-4xl flex flex-col md:gap-8">
                <div className="w-full flex flex-col justify-center items-center">
                    <img src="/plane.svg" className="w-24 h-24 md:w-32 md:h-32 mb-8" />
                    <h1 className="text-center text-4xl font-bold mb-4">Contact Us!</h1>
                    <p className="w-full max-w-lg text-center text-sm md:text-base text-zinc-500 mb-8">
                        Got a question, request, or issue with an order? Send us a message and we'll get back to you as soon as we can.
                    </p>
                </div>
                <div className="w-full flex flex-col md:flex-row justify-center items-center md:items-start gap-6 md:gap-24">
                    <div className="w-full md:w-auto">
                        <p className="text-center md:text-start font-semibold mb-2">You can find us here!</p>
                        <ContactOption
                            icon={<EnvelopeOpenIcon className="h-5 w-5" />}
                            text="info@owenspizza.com.au"
                        />
                        <ContactOption
                            icon={<PhoneIcon className="h-5 w-5" />}
                            text="1800 123 456"
                        />
                        <ContactOption
                            icon={<MapPinIcon className="h-5 w-5" />}
                            text="123 Main Street, Brisbane QLD 4000"
                        />
                    </div>
                    
                    <div className="w-full md:w-auto">
                        <p className="text-center md:text-start font-semibold mb-2">We're open from...</p>
                        {hours.map(h => (
                            <div className="w-full flex justify-center md:justify-start items-center gap-2" key={h.day}>
                                <CalendarIcon className="h-5 w-5" />
                                <p className="text-zinc-700">{h.day}: {h.start} - {h.finish}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Main>
    );
}
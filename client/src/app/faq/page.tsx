import React from "react";
import Main from "@/components/Main";
import Title from "@/components/Text";

interface FaqProps {
    imgUrl: string
    header: string
    body: string
}

function Faq({ imgUrl, header, body }: FaqProps) {
    return (
        <div className="w-full flex flex-col justify-center items-center">
            <img src={imgUrl} className="w-24 h-24 mb-6" />
            <h2 className="text-center font-semibold text-2xl md:text-3xl mb-4">{header}</h2>
            <p className="text-zinc-600 text-center">{body}</p>
        </div>
    );
}

const faqs = [
    {
        imgUrl: "/pizza2.svg",
        header: "How do I place an order?",
        body: "You can choose any of our pizzas or build your own. Once you've picked your items, head to the checkout and select either pickup or delivery."
    },
    {
        imgUrl: "/delivery.svg",
        header: "Do you offer delivery?",
        body: "Yep! We deliver within our local area. Just enter your address at checkout and we'll let you know if we can deliver to you."
    },
    {
        imgUrl: "/cash.svg",
        header: "Can I pay with cash?",
        body: "Yes. You can choose to pay online or with cash when you arrive for pickup or when the delivery driver arrives."
    },
    {
        imgUrl: "/card.svg",
        header: "What payment methods do you accept?",
        body: "We support all major cards, Apple Pay, Google Pay, and cash. If you're paying online, the transaction is handled securely through our payment provider."
    },
    {
        imgUrl: "/pizza.svg",
        header: "Can I customise my pizza?",
        body: "Absolutely! Choose your crust, sauce, and toppings to make your perfect pizza. Prices update automatically as you add or remove ingredients."
    },
]

export default function faqPage() {
    return (
        <Main className="md:py-24">
            <Title text="Frequently Asked Questions" className="mb-16" />
            <div className="w-full max-w-2xl space-y-24">
                {faqs.map(faq => (
                    <Faq
                        key={faq.header}
                        imgUrl={faq.imgUrl}
                        header={faq.header}
                        body={faq.body}
                    />
                ))}
            </div>
        </Main>
    );
}
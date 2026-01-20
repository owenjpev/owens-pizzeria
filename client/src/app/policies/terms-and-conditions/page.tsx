import React from "react";
import Main from "@/components/Main";
import Title from "@/components/Text";

export default function TACPolicyPage() {
	return (
		<Main className="prose prose-zinc max-w-3xl mx-auto py-10">
			<Title text="Terms & Conditions" className="mb-16" />

			<p className="text-zinc-600 text-center">
				Welcome to Pizza Shop. By accessing or using our website, you agree to the following terms. These terms are intentionally simplified for demonstration purposes.
			</p>

			<h2 className="text-center text-2xl md:text-3xl font-bold mt-16 mb-4">Ordering</h2>
			<p className="text-zinc-600 text-center">
				When placing an order, you agree that all information provided is accurate and complete. Orders cannot be modified once they enter preparation.
			</p>

			<h2 className="text-center text-2xl md:text-3xl font-bold mt-16 mb-4">Payment</h2>
			<p className="text-zinc-600 text-center">
				Payments must be completed using the accepted payment methods shown at checkout. All prices are listed in AUD and may change without notice.
			</p>

			<h2 className="text-center text-2xl md:text-3xl font-bold mt-16 mb-4">Cancellations & Refunds</h2>
			<p className="text-zinc-600 text-center">
				Refunds may be issued only in cases where the order cannot be fulfilled. Once an order is prepared or delivered, refunds may not be available.
			</p>

			<h2 className="text-center text-2xl md:text-3xl font-bold mt-16 mb-4">User Accounts</h2>
			<p className="text-zinc-600 text-center">
				You are responsible for maintaining the confidentiality of your account and password. We may suspend accounts that violate these terms or misuse the platform.
			</p>

			<h2 className="text-center text-2xl md:text-3xl font-bold mt-16 mb-4">Limitation of Liability</h2>
			<p className="text-zinc-600 text-center">
				Pizza Shop is not liable for damages arising from the use of the website, including delays, errors, or failed deliveries beyond our control.
			</p>

			<h2 className="text-center text-2xl md:text-3xl font-bold mt-16 mb-4">Changes to Terms</h2>
			<p className="text-zinc-600 text-center">
				We may update these Terms & Conditions at any time. Continued use of the website implies acceptance of any new terms.
			</p>

			<p className="mt-6 text-sm text-zinc-500">Last updated: {new Date().getFullYear()}</p>
		</Main>
	);
}

import React from "react";
import Main from "@/components/Main";
import Title from "@/components/Text";

export default function PrivacyPolicyPage() {
	return (
		<Main className="prose prose-zinc max-w-3xl mx-auto py-10">
			<Title text="Privacy Policy" className="mb-16" />

			<p className="text-zinc-600 text-center">
				Your privacy is important to us. This Privacy Policy outlines how Pizza Shop collects, uses, and protects your information when you use our website.
			</p>

			<h2 className="text-center text-2xl md:text-3xl font-bold mt-16 mb-4">Information We Collect</h2>
			<p className="text-zinc-600 text-center">
				We may collect personal information such as your name, email address, delivery details, and order preferences when you place an order or create an account.
			</p>

			<h2 className="text-center text-2xl md:text-3xl font-bold mt-16 mb-4">How We Use Your Information</h2>
			<ul className="list-disc pl-6 text-zinc-600">
				<li>To process your orders</li>
				<li>To improve our services and menu</li>
				<li>To send important updates about your order</li>
			</ul>

			<h2 className="text-center text-2xl md:text-3xl font-bold mt-16 mb-4">Sharing of Information</h2>
			<p className="text-zinc-600 text-center">
				We do not sell your data. We may share necessary order and delivery information with third-party services such as payment processors and delivery partners.
			</p>

			<h2 className="text-center text-2xl md:text-3xl font-bold mt-16 mb-4">Cookies</h2>
			<p className="text-zinc-600 text-center">
				We use cookies to enhance your browsing and ordering experience. You can disable cookies in your browser settings.
			</p>

			<h2 className="text-center text-2xl md:text-3xl font-bold mt-16 mb-4">Security</h2>
			<p className="text-zinc-600 text-center">
				While we strive to protect your information, no method of transmission is 100% secure. We take reasonable steps to protect your data.
			</p>

			<h2 className="text-center text-2xl md:text-3xl font-bold mt-16 mb-4">Changes to This Policy</h2>
			<p className="text-zinc-600 text-center">
				We may update this Privacy Policy at any time. Changes take effect immediately when posted on this page.
			</p>

			<p className="mt-6 text-sm text-zinc-500">Last updated: {new Date().getFullYear()}</p>
		</Main>
	);
}

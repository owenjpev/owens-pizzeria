import Link from "next/link";

export default function Footer() {
	const year = new Date().getFullYear();

	return (
		<footer className="border-t border-zinc-200 bg-white px-6">
			<div className="mx-auto max-w-7xl py-10">
				<div className="grid gap-8 md:grid-cols-4">
					<div className="md:col-span-2 space-y-3">
						<p className="text-xl font-semibold tracking-tight">Owen's Pizzeria</p>
						<p className="text-sm text-zinc-600">
							Fresh, custom pizzas made your way. Order online, sit back, and we'll handle the rest.
						</p>
					</div>

					<div className="space-y-3">
						<p className="text-sm font-semibold text-zinc-900">Menu</p>
						<ul className="space-y-2 text-sm text-zinc-600">
							<li>
								<Link href="/" className="hover:text-zinc-900 transition-colors">Home</Link>
							</li>
							<li>
								<Link href="/menu" className="hover:text-zinc-900 transition-colors">Our Menu</Link>
							</li>
							<li>
								<Link href="/cart" className="hover:text-zinc-900 transition-colors">Cart</Link>
							</li>
							<li>
								<Link href="/checkout" className="hover:text-zinc-900 transition-colors">Checkout</Link>
							</li>
						</ul>
					</div>

					<div className="space-y-3">
						<p className="text-sm font-semibold text-zinc-900">Support</p>
						<ul className="space-y-2 text-sm text-zinc-600">
							<li>
								<Link href="/faq" className="hover:text-zinc-900 transition-colors">FAQ</Link>
							</li>
							<li>
								<Link href="/contact" className="hover:text-zinc-900 transition-colors">Contact</Link>
							</li>
							<li>
								<Link href="/policies/privacy" className="hover:text-zinc-900 transition-colors">Privacy policy</Link>
							</li>
							<li>
								<Link href="/policies/terms-and-conditions" className="hover:text-zinc-900 transition-colors">Terms & conditions</Link>
							</li>
						</ul>
					</div>
				</div>

				<div className="mt-8 flex flex-col gap-3 border-t border-zinc-200 pt-4 text-xs text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
					<p>© {year} Owen's Pizzeria. All rights reserved.</p>
					<p className="text-zinc-400">
						Built with love and way too much pizza.
					</p>
				</div>
			</div>
		</footer>
	);
}

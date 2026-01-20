export type Base = { id: number; name: string; price_cents: number; };
export type Sauce = { id: number; name: string; price_cents: number; };
export type Topping = { id: number; name: string; price_cents: number; };

export type PizzaFull = {
    id: number;
    name: string;
    description: string | null;
    price_cents: number;
    image_url: string | null;
    base: Base;
    sauce: Sauce;
    toppings: Topping[];
};

export type CartItem = {
	id: number;
	cart_id: string;
	pizza_id: number | null;
	display_name: string;
	image_url: string | null;
	description: string | null;

	quantity: number;
	unit_price_cents: number;
	line_total_cents: number;

	base: Base | null;
	sauce: Sauce | null;

	custom_base: string | null;
	custom_sauce: string | null;

	regular_toppings: Topping[];
	added_toppings: Topping[];
	removed_toppings: Topping[];
	final_toppings: Topping[];
};


export type CartResponse = {
	id: string | null;
	items: CartItem[];
	subtotal_cents: number
};

export type Item = {
	id: number
	display_name: string
	image_url: string | null
	description: string | null
	quantity: number
	line_total_cents: number
	custom_base: string | null
	custom_sauce: string | null
	added_toppings: Topping[]
	removed_toppings: Topping[]
	final_toppings: Topping[]
}

export type Order = {
	id: string
	user_id: string
	total_cents: number
	subtotal_cents: number
	delivery_cents: number
	discount_cents: number
	method: string
	payment_status: string
	payment_type: string
	created_at: string
	first_name: string
	last_name: string
	email: string
	phone: string
	address_line1: string | null
	address_line2: string | null
	suburb: string | null
	state: string | null
	postcode: string | null
	notes: string | null
}

export type OrderPreview = {
    id: string
    total_cents: number
    method: string
    created_at: string
    payment_status: string
}
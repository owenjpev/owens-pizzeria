# Introduction

Owen’s Pizzeria is a full-stack pizza ordering platform where customers can browse pizzas, customize their order, manage their cart, and check out using Stripe’s demo mode.

Admins can create and manage bases, sauces, toppings, pizzas, and even other admins.

This project was built as a full-stack learning + portfolio piece using **Next.js, TypeScript, Tailwind CSS, Node.js, and PostgreSQL**.

It should be noted, however, that **this is not a 100% complete app!** It is still in progress, and some things are not quite finished yet (e.g., loading screens, neater error messages, etc).

---

## Features

### Customer Features
- Browse menu and order pizzas (pickup or delivery)
- Customize pizzas with bases, sauces, and toppings
- Add/remove items from cart
- Create an account and log in
- View past orders
- Stripe demo checkout integration
- FAQ, Contact, Privacy Policy, Terms & Conditions pages

### Admin Features
- Admin dashboard
- Create / update / delete:
  - Bases
  - Sauces
  - Toppings
  - Pizzas
- Create additional admin accounts

---

## Things I would like to add soon

Some things I would like to add include:
- Data encryption for sensitive data
- Webhook for Stripe integration
- Admin page for `GET: /admins` and `GET: /orders`
- Some sort of email sending service for confirmation emails after placing orders
- Two factor authentication
- Image upload
- Image compression (for faster loading times)
- HTML preload when hovering over a link (also for faster loading times)

---

## Installation & Setup

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/owens-pizzeria.git
cd owens-pizzeria
```

### 2. Install dependencies
```bash
npm install
```

### 3. Create a .env.local file
```ini
PORT=5000
DATABASE_URL=postgres://user:password@localhost:5432/database
ADMIN_SECRET=password
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
PUBLIC_BASE_URL=http://localhost:3000_or_your_domain
CURRENCY=aud
SESSION_SECRET=someridiculouslylongrandomstring
CLIENT_ORIGIN=http://localhost:3000_or_your_domain
```

### 4. Run the dev server
```bash
npm run dev
```
Your app will be available at http://localhost:3000!

## Database Schema (High-Level)

The database includes:
- users
- session
- pizzas
- bases
- sauces
- toppings
- carts
- cart_items
- orders
- order_items

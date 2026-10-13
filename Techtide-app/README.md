# Kindred — Full-Stack E-Commerce Store

A complete e-commerce site: React (Vite) frontend, Node/Express + MySQL backend,
JWT auth, Stripe payments, and a full admin dashboard for managing products and orders.

## Stack

- **Frontend:** React 18, React Router, Axios, Stripe Elements, Vite
- **Backend:** Node.js, Express, MySQL (mysql2), JWT, bcrypt, Stripe
- **Auth:** JSON Web Tokens, roles (`customer` / `admin`)

## Project structure

```
ecommerce-app/
  backend/
    config/db.js         MySQL connection pool
    middleware/           auth + admin guards
    routes/                auth, products, cart, orders, payment, admin
    utils/seed.js         sample data + admin user
    schema.sql             database schema
    server.js
  frontend/
    src/
      api/axios.js         API client (attaches JWT)
      context/              Auth + Cart state
      components/           Navbar, Footer, ProductCard, route guards
      pages/                 all customer-facing pages
      pages/admin/            admin dashboard, product & order management
```

## 1. Prerequisites

- Node.js 18+
- MySQL 8+ (or MariaDB) running locally or remotely
- A free Stripe account (test mode) for payments: https://dashboard.stripe.com

## 2. Database setup

```bash
mysql -u root -p < backend/schema.sql
```

This creates the `ecommerce_db` database and all tables.

## 3. Backend setup

```bash
cd backend
cp .env.example .env
```

Edit `.env`:
- `DB_USER` / `DB_PASSWORD` — your MySQL credentials
- `JWT_SECRET` — any long random string
- `STRIPE_SECRET_KEY` — from Stripe Dashboard → Developers → API keys (use the **test** secret key, starts with `sk_test_`)
- `STRIPE_WEBHOOK_SECRET` — see step 5 below

Install and seed:

```bash
npm install
npm run seed     # creates sample products, categories, and an admin login
npm run dev       # starts the API on http://localhost:5000
```

The seed script prints the admin email/password it created (default `admin@example.com` / `ChangeMe123!` — override via `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `.env` before seeding).

## 4. Frontend setup

```bash
cd frontend
cp .env.example .env
```

Edit `.env`:
- `VITE_STRIPE_PUBLISHABLE_KEY` — from Stripe Dashboard (starts with `pk_test_`)

Install and run:

```bash
npm install
npm run dev       # starts the app on http://localhost:5173
```

The Vite dev server proxies `/api` requests to the backend, so both must be running.

## 5. Stripe webhook (for order payment confirmation)

Install the Stripe CLI, then in a separate terminal:

```bash
stripe login
stripe listen --forward-to localhost:5000/api/payment/webhook
```

Copy the `whsec_...` value it prints into `backend/.env` as `STRIPE_WEBHOOK_SECRET`, then restart the backend.

For testing payments, use Stripe's test card: `4242 4242 4242 4242`, any future expiry, any CVC/ZIP.

## 6. Using the app

- Browse the store at `http://localhost:5173`
- Register a customer account, add items to cart, and check out
- Log in as the seeded admin account and visit `/admin` to:
  - View revenue, order, and low-stock stats
  - Add, edit, and remove products
  - Update order statuses (pending → processing → shipped → delivered)

## Notes on going to production

- Swap `dateStrings: true` MySQL config and add proper migrations (e.g. Knex or Prisma) if the schema will evolve
- Move product images to a real object store (S3, Cloudinary) instead of external URLs
- Add rate limiting (e.g. `express-rate-limit`) on auth routes
- Put the JWT in an httpOnly cookie instead of localStorage for stronger XSS protection
- Add pagination to the admin product/order tables once catalog size grows
- Set `NODE_ENV=production`, serve the built frontend (`npm run build`) behind a CDN, and run the backend behind a process manager (PM2) or a container

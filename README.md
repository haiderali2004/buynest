# BuyNest

A full-stack e-commerce store for premium clothing, built with Next.js 16. Customers can browse products, manage a cart and wishlist, check out with Safepay, track orders, and request returns — while admins manage products, categories, discounts, orders, and returns from a built-in dashboard.

**Tech stack:** Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind CSS 4 · Supabase (Postgres, Auth, Storage) · Prisma · Safepay (payments) · Resend (transactional email) · Zustand · Vitest

## Features

- Storefront with categories, search, new-in and sale sections
- Cart, wishlist, and multi-step checkout with server-side price verification
- Stock reservation at checkout with automatic release of expired reservations
- Safepay payment integration with webhook-driven order finalization
- Customer accounts: order history, addresses, returns, profile settings
- Admin dashboard: products, categories, discounts, orders, returns
- Transactional emails (order confirmation, status updates) via Resend
- Row Level Security via Supabase, plus a session-refreshing proxy (middleware)

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) 20 or newer (comes with npm)
- [Git](https://git-scm.com)
- A free [Supabase](https://supabase.com) account (provides the database and auth)
- Optional: a [Safepay](https://getsafepay.com) sandbox account for testing payments, and a [Resend](https://resend.com) account for emails — the site runs without both

### 1. Clone and install

```bash
git clone https://github.com/haiderali2004/buynest.git
cd buynest
npm install
```

### 2. Configure environment variables

Copy the example env file:

```bash
# Windows
copy .env.local.example .env.local

# macOS / Linux
cp .env.local.example .env.local
```

Then open `.env.local` and fill in your values. Create a new project on Supabase first, then grab:

| Variable | Where to find it |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API (keep secret, server-only) |
| `DATABASE_URL` | Supabase → Project Settings → Database (pooled, port 6543) |
| `DIRECT_URL` | Supabase → Project Settings → Database (direct, port 5432) |
| `SAFEPAY_*` | Safepay dashboard (optional — needed only for checkout payments) |
| `RESEND_API_KEY`, `EMAIL_FROM` | Resend dashboard (optional — needed only for emails) |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` for local development |
| `CRON_SECRET` | Any long random string |

The comments inside `.env.local.example` explain each value in more detail.

### 3. Set up the database

The database starts empty — these commands create the tables, generate the Prisma client, and load sample products:

```bash
npx supabase login
npx supabase link --project-ref YOUR-PROJECT-REF
npm run db:migrate     # creates all tables, triggers, and RLS policies
npm run db:generate    # generates the Prisma client
npm run db:seed        # loads sample categories and products
```

Your project ref is the random string in your Supabase project URL (`https://YOUR-PROJECT-REF.supabase.co`).

### 4. Run the site

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — the storefront should load with the seeded products.

### 5. Create an admin account (optional)

Register a normal account through the site at `/register`, then promote it:

```bash
npm run admin:promote -- your-email@example.com
```

Log back in and visit `/admin` for the dashboard.

## Available Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm start` | Serve the production build |
| `npm run lint` | Run ESLint |
| `npm test` | Run the Vitest test suite |
| `npm run db:migrate` | Push the SQL migrations to Supabase |
| `npm run db:generate` | Regenerate the Prisma client |
| `npm run db:seed` | Seed sample data |
| `npm run db:studio` | Open Prisma Studio (database GUI) |
| `npm run admin:promote` | Promote a registered user to admin |

## Project Structure

```
app/            Routes (App Router) — storefront, auth, account, admin, API
components/     React components grouped by area (layout, product, cart, admin…)
lib/            Server logic — Prisma client, Supabase clients, orders, email, validation
prisma/         Prisma schema and seed script
supabase/       SQL migrations (source of truth for the database schema)
store/          Zustand client-side stores (cart, wishlist)
types/          Shared TypeScript types
```

## Deployment

The app deploys cleanly to [Vercel](https://vercel.com): import the repo, add every variable from `.env.local` to the project's environment settings (with `NEXT_PUBLIC_SITE_URL` set to your production URL), and deploy. Configure the Safepay webhook to point at `https://your-domain.com/api/webhooks/safepay`, and schedule a cron job to hit `/api/cron/release-reservations` (with the `CRON_SECRET` bearer token) to release expired stock reservations.

# Cyber Shop API

Express 5 + Prisma 7 + PostgreSQL (Neon) backend for the Cyber dropshipping store.

## Run locally

```bash
npm install
cp .env.example .env          # then fill in DATABASE_URL + JWT_SECRET
npm run db:deploy             # create the tables
npm run db:seed               # 4 categories, 3 suppliers, 38 products, bundles, demo users
npm run dev                   # http://localhost:5000/api/health
```

No database yet? `npx prisma dev` starts a local Postgres. Use the `postgres://...` TCP URL it prints
(change the database name at the end to `/postgres`), and set `DB_POOL_MAX=1`.

Demo logins after seeding: `admin@cyber.dev / Admin12345!` and `demo@cyber.dev / Demo12345!`

## Prisma in 60 seconds

| You want to…                     | Do this                                                    |
| -------------------------------- | ---------------------------------------------------------- |
| Change the database structure    | Edit `prisma/schema.prisma`, then `npm run db:migrate -- --name what-changed` |
| Browse/edit data in a UI         | `npm run db:studio`                                        |
| Re-fill demo data                | `npm run db:seed` (safe to run again; it upserts)          |
| Wipe everything and start over   | `npm run db:reset` (drops all data!)                       |
| Apply migrations in production   | `npm run db:deploy` (Render runs this in `npm run build`)  |

- The generated client lives in `src/generated/prisma` (gitignored, created by `npm install`).
- Money is stored as **integer tetri** (`priceCents: 389900` = 3 899 ₾). Prices include VAT, so no tax is added.
- "Cheaper together" bundles (`BundleItem`) discount an accessory when it's in the same order as its main product.
  The server applies them in `/api/orders/quote` and when placing the order (`src/lib/pricing.js`).
- Online payment is off for now: orders without `payment` are created `UNPAID`; admins mark them paid.
- `costCents` and supplier details never leave the server (see `src/lib/serializers.js`).

## API

| Method | Path | Notes |
| ------ | ---- | ----- |
| GET | `/api/health` | DB check |
| GET | `/api/categories` | with product counts |
| GET | `/api/products` | `category, q, brands, conditions, minPrice, maxPrice, onSale, featured, bestseller, sort, page, limit` |
| GET | `/api/products/facets` | brands, conditions + price range for the filter sidebar |
| GET | `/api/products/:slug` | product (+ `descriptionKa`), its bundle offers, related |
| POST | `/api/auth/register`, `/api/auth/login` | returns `{ token, user }` |
| GET | `/api/auth/me` | Bearer token |
| GET/PUT/DELETE | `/api/favorites[/:productId]` | Bearer token |
| POST | `/api/orders/quote` | re-prices a cart with live prices/stock |
| POST | `/api/orders` | guest or signed in; `payment` optional (omitted = UNPAID); demo card `…0002` is declined |
| GET | `/api/orders`, `/api/orders/:orderNumber?email=` | |
| GET | `/api/admin/stats` | admin only; totals, 30-day sales, low stock |
| GET | `/api/admin/orders?status=&q=` | admin only, with supplier info per item |
| PATCH | `/api/admin/orders/:id` | `{ status, trackingNumber }`; cancelling restocks |
| GET/POST | `/api/admin/products` | `?q, categoryId, condition, status, stock` (status: active/archived/all, stock: low/out); full fields incl. cost |
| GET/PUT/PATCH/DELETE | `/api/admin/products/:id` | PUT replaces (images too); PATCH for archive/stock/flags; DELETE only without orders |
| GET/POST/PUT/DELETE | `/api/admin/categories[/:id]`, `/api/admin/suppliers[/:id]` | delete only when empty |
| GET/PATCH | `/api/admin/users[/:id]` | `?q`; PATCH `{ role }` (not your own) |
| POST | `/api/admin/uploads` | multipart `image` -> Cloudinary `{ url, publicId }`; needs `CLOUDINARY_URL` |

The admin panel lives in its own repo (`cyber-shop-admin`); add its URL to `CLIENT_ORIGIN`.

Errors always look like `{ "error": "message", "details": { "field": "message" } }`.

## Images / Cloudinary

Seed images come from dummyjson's CDN and from `public/products` (Wikimedia Commons photos, credited
via `sourceUrl`). To move them all to your Cloudinary account, set `CLOUDINARY_URL` and run:

```bash
npm run images:upload
```

## Deploy on Render

1. New **Web Service** → this repo. Root directory: repo root.
2. Build command: `npm install && npm run build`. Start command: `npm start`.
3. Environment: `DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET`, `CLIENT_ORIGIN=https://<your-app>.vercel.app`, `NODE_ENV=production`.
4. After the first deploy, seed once from your machine: put the Neon URLs in your local `.env` and run `npm run db:seed`.

The free plan sleeps after 15 minutes idle. The frontend shows a "waking up the server" notice when that happens.

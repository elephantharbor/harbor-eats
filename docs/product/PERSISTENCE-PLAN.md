# Persistence plan — Workers + Pages + D1

**Skeleton:** [`product/app/`](../../product/app/)

## Target stack

- **Cloudflare Pages** — static shell (prototype UI or built bundle)
- **Workers** — API routes (`/api/*`)
- **D1** — households, members, plans, ratings, taste signals

## Blocker

D1 database creation requires Cloudflare API token with **Account · D1 · Edit**. Until granted, prototype uses `localStorage` only.

## Migration path

1. Deploy prototype statically (current)
2. Wire `product/app` Worker for CRUD + auth stub
3. Replace [`product/prototype/js/store.js`](../../product/prototype/js/store.js) persistence with `fetch('/api/...')` — keep routes and Bloom events stable
4. Run SQL in [`product/app/migrations/`](../../product/app/migrations/)

## Data entities (v0)

- `households`, `members`, `constraints`, `plans`, `plan_options`, `ratings`, `taste_signals`, `attribution_events`

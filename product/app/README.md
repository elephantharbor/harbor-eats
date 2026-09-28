# Harbor Eats — Persistence app (skeleton)

Cloudflare Workers + D1 backend for the consumer product. **Not wired to the prototype UI yet.**

## Prerequisites

- Wrangler CLI (`npm i`)
- Cloudflare account
- API token with **Account · D1 · Edit** (required to create D1 — currently blocked for some tokens)

## Layout

```
product/app/
  wrangler.toml      # Pages + Worker binding stub
  package.json
  migrations/        # D1 SQL
  src/index.ts       # Health + placeholder API
```

## Commands (when token ready)

```bash
cd product/app
npm install
npx wrangler d1 create harbor-eats-dev   # requires D1 Edit
npx wrangler d1 migrations apply harbor-eats-dev --local
npm run dev
```

## API (planned)

- `GET /api/health`
- `POST /api/households`, `GET /api/households/:id`
- `POST /api/plans`, `POST /api/ratings`
- `POST /api/events` — Bloom `HE-INV`, `HE-SHARE`, `loop_completed`

Prototype continues to log events locally until this layer is connected.

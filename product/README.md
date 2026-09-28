# Harbor Eats — Product (consumer)

Single consumer surface in this repo — no parallel app trees.

| Path | Role |
|------|------|
| [`prototype/`](prototype/) | UX static vertical slice (onboarding → N×3 → cook → dual **1–10** ratings → loop closed; PLG S1/S2/S3) |
| [`app/`](app/) | Persistence skeleton (Cloudflare Pages + Workers + D1 migrations) |
| [`../docs/product/`](../docs/product/) | UX direction, PRD, persistence plan, decisions |

## Local run (prototype)

From repo root:

```bash
python3 -m http.server 8080
```

Open http://localhost:8080/product/prototype/

## Interim public URL

Static export of **prototype only** (Operating Desk stays on github.io/harbor-eats):

https://elephantharbor.github.io/harbor-eats-app/

Deploy that site from `product/prototype/` contents — not from repo root `/`.

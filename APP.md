# Harbor Eats — Consumer app

Mobile-first product preview at **`/app/`** (separate from the Operating Desk at `/`).

## Local run

From the repository root:

```bash
python3 -m http.server 8080
```

- Operating Desk: http://localhost:8080/
- Consumer app: http://localhost:8080/app/

Use a phone-sized viewport or your device on the same network. State persists in `localStorage` on that browser.

## Walkthrough (fastest)

1. Open `/app/`
2. Tap **Try SYN demo walkthrough** — loads household `SYN-DEMO-001` (synthetic, not HH001)
3. Pick one of three options → recipe → **Start cook mode** → **Mark as cooked**
4. Rate each member **1–10** → confirm taste model update
5. Optional: **Request another plan** from home

Full onboarding: **Get started** → household → members → hard dietary locks → taste seed → invite stub → first plan.

## Deploy (Cloudflare Pages)

This repo is static-first and Pages-ready:

1. Connect the GitHub repo in Cloudflare Pages.
2. Build command: *(none)*  
   Build output directory: `/` (repo root)
3. The consumer app is served from `/app/index.html`.
4. Analytics events log to the browser console and `localStorage` key `he-consumer-analytics` (`onboard_complete`, `plan_viewed`, `selected`, `cooked`, `rated`).

### Later: Workers + D1

- Keep `/app/` as the static shell.
- Add a Worker route (e.g. `/api/*`) for household sync, plan generation, and ratings — replace `store.js` persistence with fetch calls without changing routes in the UI.

## Product notes

- Ratings are **1–10** per household member.
- Eligibility gate rejects meals that violate hard constraints (dairy, shellfish, meat≠fish, poultry, nuts except cashew when configured).
- No agent, batch, or experiment IDs in the consumer UI.
- Synthetic demo households use the `SYN-*` prefix and an on-screen **Synthetic demo** badge.

# Production release — 2026-10-04 06:36 CT

Oversight accepted everything through D-03B. That includes Cycle 3B / D-01. D-04, D-05, and D-06 were not started. No Catalog Factory candidates. No new meals.

## Shipped

| Field | Value |
|---|---|
| Product runtime | `991db9e4770df6b460d3f9594ce29a114101c33e` |
| Service worker | `fw-sw-v16` |
| Docs-only tip (not required) | `9570b4f1700e6fbb464ec629379ef307bf948f3b` (docs only vs runtime) |
| GitHub `main` | `97952206ef03363be726f22e0df6152251c0b931` — not fast-forwarded |
| Pages production | `7bca4afe-e2a4-4178-be79-f30443499995` → https://harbor-eats-app.pages.dev |
| Worker version | `be960ae6-d6a4-411f-a3a6-ee6f5e7c9879` → https://harbor-eats-app.elephantharbor.workers.dev |
| D1 | `23aa3db3-1090-471b-8c8a-b6fe71f5c053` through `0011` |
| Migration sequence | `0008` + `0009` + `0010` + `0011` as one pre-traffic sequence |
| Prior production | Pages `af0dca40-343f-4bf7-b1c4-2e629c526a4f` (git `97952206`, `fw-sw-v3`, D1 through `0007`) |

## Evidence origin

`0008` was not left without `0009`. Pre-existing households (68), plans (45), ratings (13), events (230), and preference rows (7) are `unproven`, not `household`. Constraint rules remain 60. Migration guard rows are gone. Dinner-plan rows 0. Recipe-package rows 0. HH-001 was not identified from the repo and was not stamped.

Smoke created one synthetic kitchen (`data_origin=synthetic`, `acquisition_source=synthetic_qa`). It is not HH-001 and is not household evidence. After smoke, `data_origin=household` counts were 0 on household and plan.

## Release checks

On `991db9e`: migration check 11 OK, unit 447/40 files, lint clean. Playwright was not re-run (campaign record on this SHA was 27 passed).

Smoke PASS on Pages production and the Worker: health `d1=ok`, catalog 24, `catalog_quality_ok`, `fw-sw-v16`, nav (Home / Tonight / History / Profile), unauth session 401, unauth plan 401, unauth dinner-plan 401, synthetic session, 3 recommendations, recipe detail 200, `GET /api/dinner-plans/current` 200 with `plan: null`, cross-household state 403. No rollback.

## Catalog Factory (desk only)

Established. Juniper is Curator. Vale is the Harbor Eats Catalog Auditor (Gaming also has a Vale). Catalog still 24. Dry run pending. Legacy-24 audit pending. Catalog Factory D1 runtime migration planned, not executed.

## Not done

No merge of `feature/flavorweave-alpha-remediation` onto GitHub `main`. No HH-001 origin stamp. No cashew-permission write. No D-04 / D-05 / D-06.

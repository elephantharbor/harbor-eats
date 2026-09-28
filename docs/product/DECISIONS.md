# Product decisions log

| Date | Decision | Notes |
|------|----------|--------|
| 2026-09-28 | **Rating scale 1–10** | Locked by Cora / Thomas; consumer prototype enforces per-member 1–10 |
| 2026-09-28 | **Single consumer path** | `product/prototype/` + `product/app/` — no `/app/` fork at repo root |
| 2026-09-28 | **Desk untouched** | Operating dashboard remains `/` on harbor-eats github.io |
| 2026-09-28 | **Public consumer URL** | https://elephantharbor.github.io/harbor-eats-app/ exports prototype only |
| 2026-09-28 | **Bloom attribution** | `HE-INV`, `HE-SHARE` events; **`loop_completed`** carries attribution payload |
| 2026-09-28 | **Synthetic demo** | `SYN-DEMO-001` — never presented as HH001 evidence |

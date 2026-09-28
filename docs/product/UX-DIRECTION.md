# Harbor Eats — UX direction (consumer)

**Owner:** Mira (Product & Experience) · **Lock:** Cora / Thomas · **Rating scale:** **1–10** (not 1–5)

## Principles

- Mobile-first, consumer polish — not Operating Desk chrome
- Uncluttered cards, strong typography, Harbor tokens (Ink, Deep Tide, Signal Brass, Canvas, Fog, Eats accent)
- Ease over exhaust: minimal onboarding taste seed, learn from cook + dual ratings
- Never surface agent IDs, batch IDs, or HH001 evidence in consumer UI
- Synthetic walkthroughs use `SYN-*` labels prominently

## Canonical prototype

Implementation: [`product/prototype/`](../../product/prototype/)

Interim public URL: https://elephantharbor.github.io/harbor-eats-app/

## PLG slices in prototype

| Slice | UX | Bloom event |
|-------|-----|-------------|
| S1 | Invite link during onboarding | `HE-INV` |
| S2 | Share full 3-option choice-set from plan view | `HE-SHARE` |
| S3 | Welcome demo card → SYN household | (demo; no real attribution) |

Attribution on inbound links (`?HE-INV=`, `?HE-SHARE=`) is stored and emitted on **`loop_completed`**.

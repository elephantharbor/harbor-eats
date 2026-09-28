# PRD — Vertical slice (MVO)

## Goal

Ship a walkable **closed loop** for one household: constraints → plan (3 options) → selection → recipe → cook mode → dual **1–10** ratings → taste model tick → request again.

## In scope (prototype)

- [x] Onboarding: household, members, hard locks, taste seed, invite stub
- [x] Eligibility gate (dairy, shellfish, meat≠fish, poultry, nuts except cashew)
- [x] N×3 plan generation (client-side, deterministic)
- [x] Cook mode + mark cooked
- [x] Per-member ratings **1–10**
- [x] SYN-DEMO-001 synthetic path
- [x] Bloom attribution events through `loop_completed`

## Out of scope (this slice)

- Real HH001 cooks/ratings as product evidence
- Server persistence (see [`PERSISTENCE-PLAN.md`](PERSISTENCE-PLAN.md))
- Payments, grocery, full recipe CMS

## Success criteria

- New user completes loop in <5 minutes on a phone
- Desk at `/` unchanged
- Prototype exportable to harbor-eats-app Pages URL

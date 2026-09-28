# Harbor Eats — Product prototype (vertical slice)

Mobile-first static SPA. State in `localStorage` (`he-product-prototype-v1`).

## Flow

1. Onboarding → hard dietary locks → taste seed → **S1** invite (`HE-INV`)
2. Request plan → **S2** shareable choice-set (`HE-SHARE`) → select → recipe → cook mode
3. Dual **1–10** ratings per member → taste model update → **`loop_completed`** (Bloom attribution payload)

**S3:** Welcome demo card loads `SYN-DEMO-001` (synthetic, not HH001).

## Analytics (local)

Console + `localStorage` key `he-product-analytics`:

- Funnel: `onboard_complete`, `plan_viewed`, `selected`, `cooked`, `rated`
- Bloom: `HE-INV`, `HE-SHARE`, `loop_completed` (includes attribution)

## Export for harbor-eats-app Pages site

Publish **this directory** as the site root (no desk assets):

```bash
# example: copy or point Pages build output to product/prototype/
```

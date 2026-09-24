# Harbor Eats — Operating dashboard

Public-safe operating dashboard for the Harbor Eats segment (on-demand meal plans for Tom and Renata).

## Live URL

https://elephantharbor.github.io/harbor-eats/

On `elephantharbor.github.io`, the shell redirects to the authenticated console at `https://console.elephantharbor.com/harbor-eats/` (same pattern as Harbor Foundry and Harbor Presence). Local development and direct file hosting use the native SPA without that redirect.

## Local preview

From the repo root:

```bash
python3 -m http.server 8080
```

Open http://localhost:8080/ and use the tab nav (Overview, Plans, Recipes, Preferences, Lessons, Log, Docs).

## Data

| File | Role |
|------|------|
| `data/snapshot.json` | Sole SPA data source (plans, recipes, preferences, activity, docs) |
| `data/segment-summary.json` | Portfolio tile contract (`dashboardUrl`, headline metrics summary) |

Do not invent metrics in the UI — render only what the snapshot contains.

## Stack

- Static HTML + shared Elephant Harbor console assets (`eh-console.css`, `eh-theme.js`, …)
- Segment-specific `static/segment.css` and `static/app.js`
- GitHub Pages from `main` at `/`

## Notion

The operating desk lives on github.io / console. A Notion Operating Desk link may appear on the **Docs** tab as an optional secondary sync target — there is no redirect to Notion.

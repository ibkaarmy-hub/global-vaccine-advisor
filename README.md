# Global Vaccine Advisor

Static Next.js site for [travelvaccineadvisor.com](https://travelvaccineadvisor.com) — travel vaccine recommendations for English-speaking travellers, sourced from the CDC.

## Stack
- Next.js 15 (App Router) + React 19 + TypeScript
- Static export (`output: 'export'`) — deployed to GitHub Pages
- No database, no API routes, no server-side features
- CSS Modules (no Tailwind)

## Local development

```bash
npm install
npm run dev            # http://localhost:3000
npm run typecheck
npm run build          # produces out/
```

## Deploy
Push to `main`. GitHub Actions (`.github/workflows/deploy.yml`) builds and deploys to GitHub Pages.

## Data
All content lives in `data/`:
- `countries.json` — country recommendations (Stage 01 output, CDC-derived)
- `vaccines.json` — vaccine catalogue (Stage 01 output)
- `country-content.json` — country-page intros (Stage 04 output)
- `seo-metadata.json` — per-page SEO + FAQ schema (Stage 05 output)
- `references.json` — structured citations for the primary co-references (CDC, WHO, NaTHNaC, PHAC, Australia DoH / Smartraveller, ECDC, ISTM)
- `destination-references.json` — per-country links to the primary co-references; rendered in the country-page sidebar
- `health-alerts.json` — **auto-managed**, do not hand-edit; refreshed fortnightly
- `clinics-sg.json`, `clinics-my.json` — **auto-managed**, do not hand-edit; synced from the Google Sheet backend (see below)

## Health alerts pipeline
`scripts/update-health-alerts.mjs` reads each `alerts_feed_url` from
`data/references.json`, fetches the RSS/Atom feed, normalises items, drops
anything older than `$retention_days` (default 60), and writes
`data/health-alerts.json`.

`.github/workflows/update-health-alerts.yml` runs the script fortnightly
(06:00 UTC, 1st and 3rd Monday of each month) plus on-demand via
`workflow_dispatch`. Successful runs commit the refreshed JSON to `main`,
which re-triggers `deploy.yml`. Per-source fetch failures are recorded in
`health-alerts.json` under `$errors` rather than failing the run.

ISTM has no public alerts feed; it is listed in `references.json` for citation
purposes only.

## Clinic data pipeline

The clinic directory (`data/clinics-sg.json`, `data/clinics-my.json`) is synced
from a Google Sheet — that is the source of truth, not these JSON files. Edit
the Sheet, then trigger a sync; the JSONs (and the static site) update from
there.

**Sheet structure** — three tabs that mirror the `Clinic` / `ClinicVaccine`
types in `lib/clinics.ts`:

| Tab | Purpose |
| --- | --- |
| `clinics` | One row per clinic: id, name, address, geo, hours, status (LIVE / VERIFY / GOV) |
| `clinic_vaccines` | One row per clinic × vaccine: price, currency, last-updated, source notes |
| `vaccines_master` | Master reference list of vaccines (slug, name, aliases, CDC info) |

The Sheet is published read-only via **File → Share → Publish to web → Entire
Document → CSV**. No API key, no service account; the sync script reads the
public CSV endpoints. To point at a different Sheet, set the
`CLINIC_SHEET_PUB_ID` repository variable (Settings → Secrets and variables →
Variables).

`scripts/sync-clinics.mjs` fetches all three tabs, validates rows, joins
`clinic_vaccines` into each clinic's `vaccines[]` array, splits by country, and
writes the JSONs. Hard validation errors (missing required fields, duplicate
ids, unsupported country codes) skip the row; soft issues (missing
lat/lng, missing `price_last_updated` on a priced row, currency/country
mismatch, status defaulting) are recorded under `$warnings` so the run never
fails the whole sync over a single bad cell. `photo_path` and `content` blocks
on each clinic are populated by separate enrichment scripts and are preserved
across syncs.

`.github/workflows/sync-clinics.yml` runs the script on the 1st and 15th of
each month (06:00 UTC) and on demand via `workflow_dispatch`. Successful runs
commit the refreshed JSONs to `main`, which re-triggers `deploy.yml`.

**Editing flow:**
1. Open the Sheet, edit, save.
2. Wait a few minutes for the publish-to-web cache to refresh (or manually
   re-publish to force it: File → Share → Publish to web → Republish).
3. Trigger the sync: GitHub → Actions → "Sync clinic data (fortnightly)" →
   Run workflow. Or wait for the next scheduled run.

## Custom domain
`public/CNAME` pins the site to `travelvaccineadvisor.com`. DNS setup (registrar side):
- 4 A records → GitHub Pages IPs (185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153)
- `www` CNAME → `ibkaarmy-hub.github.io`
- Enforce HTTPS in GitHub → Settings → Pages after DNS propagates.

## Source of truth
This repo is generated from the content project at `gva-build-content` (Google Drive). Stage outputs are copied in — do not edit data files here by hand.

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

## Custom domain
`public/CNAME` pins the site to `travelvaccineadvisor.com`. DNS setup (registrar side):
- 4 A records → GitHub Pages IPs (185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153)
- `www` CNAME → `ibkaarmy-hub.github.io`
- Enforce HTTPS in GitHub → Settings → Pages after DNS propagates.

## Source of truth
This repo is generated from the content project at `gva-build-content` (Google Drive). Stage outputs are copied in — do not edit data files here by hand.

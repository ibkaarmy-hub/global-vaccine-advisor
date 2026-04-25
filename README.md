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
- `countries.json` — 10 launch countries (Stage 01 output)
- `vaccines.json` — 18 vaccines (Stage 01 output)
- `country-content.json` — country-page intros (Stage 04 output)
- `seo-metadata.json` — per-page SEO + FAQ schema (Stage 05 output)

## Custom domain
`public/CNAME` pins the site to `travelvaccineadvisor.com`. DNS setup (registrar side):
- 4 A records → GitHub Pages IPs (185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153)
- `www` CNAME → `ibkaarmy-hub.github.io`
- Enforce HTTPS in GitHub → Settings → Pages after DNS propagates.

## Source of truth
This repo is generated from the content project at `gva-build-content` (Google Drive). Stage outputs are copied in — do not edit data files here by hand.

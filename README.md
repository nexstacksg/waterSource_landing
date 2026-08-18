# WaterSource Website

The production site is a TypeScript Next.js application in `web/`. It contains
the marketing landing page, product shop, HitPay checkout, and Evergreen CRM
order synchronization.

## Run locally

```bash
cd web
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`. See `web/README.md` for the required HitPay and
Evergreen environment variables and checkout behavior.

## Validate changes

```bash
cd web
npm run lint
npm run typecheck
npm run test:hitpay
npm run build
```

Application routes are under `web/app/`, reusable UI is under
`web/components/`, server integrations are under `web/lib/`, and browser-ready
assets are served from `web/public/assets/`.

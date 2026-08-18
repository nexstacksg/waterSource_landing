# Repository Guidelines

## Project Structure & Module Organization
The production application lives in `web/` and uses Next.js App Router with
TypeScript. Route pages and API handlers are in `web/app/`; reusable sections
and shop UI are in `web/components/`; server integrations are in `web/lib/`.
Shared styles live in `web/app/styles/`, tests in `web/tests/`, and deployable
images in `web/public/assets/`.

## Build, Test, and Development Commands
Run commands from `web/`:

- `npm install`: install dependencies.
- `npm run dev`: start the local server at `http://localhost:3000`.
- `npm run lint`: run ESLint with the Next.js ruleset.
- `npm run typecheck`: validate TypeScript without emitting files.
- `npm run test:hitpay`: run checkout and webhook integration tests.
- `npm run build`: create the production build and validate routes.

## Coding Style & Naming Conventions
Use TypeScript and 2-space indentation. Name React components in PascalCase
(`ShopClient.tsx`), helpers in camelCase, and route folders in lowercase.
Prefer server components unless browser state or event handlers require
`"use client"`. Keep secrets and privileged API calls in server-only modules.
Run ESLint and Prettier before submitting substantial changes.

## Testing Guidelines
Place tests in `web/tests/` with the `*.test.ts` suffix. Add coverage when
changing HitPay signatures, payment state transitions, or Evergreen order
creation. Before a PR, run lint, typecheck, tests, and build. Manually verify
responsive layouts, navigation, cart behavior, and the sandbox checkout flow.

## Commit & Pull Request Guidelines
History favors concise imperative subjects, often scoped, such as
`style: update product layout` or `content: revise product features`. Keep each
commit focused. PRs should explain the purpose, identify affected routes,
link relevant issues, list validation results, and include before/after
screenshots for visual changes.

## Security & Configuration
Copy `web/.env.example` to `.env.local`; never commit API keys or webhook salts.
Use HitPay sandbox credentials locally. Payment success must be verified
server-side before Evergreen customer or sales records are created.

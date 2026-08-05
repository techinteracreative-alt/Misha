# Misha Mobile

Misha is a neon AI content factory that turns a topic or pasted content into a caption-ready short-form reel blueprint for Android and iOS.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm --filter @workspace/misha-mobile run dev` — run Misha in Expo Go or the web preview
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/misha-mobile/app/(tabs)/index.tsx` — main mobile composer and reel inspector
- `artifacts/misha-mobile/constants/colors.ts` — neon visual tokens
- `artifacts/misha-mobile/assets/images/icon.png` — Misha fox app icon
- `.github/workflows/mobile-builds.yml` — manual GitHub Android/iOS build workflow

## Architecture decisions

- The first mobile release is frontend/local-first: scripts and recent builds work without paid API keys.
- AsyncStorage keeps recent reel blueprints on the device.
- The app uses Expo Router with a single focused creation screen rather than a multi-tab shell.
- GitHub Actions creates an Android APK and an unsigned iOS Simulator artifact; signed iPhone/App Store delivery requires Apple signing.

## Product

Users can enter a topic, tune tone/voice/visual direction, generate a 30-second reel script, inspect the caption-ready vertical preview, and reopen recent builds.

## User preferences

- Keep the product identity futuristic, neon, fox-led, and mobile-first.

## Gotchas

- The full workspace typecheck currently includes pre-existing React type issues in `artifacts/mockup-sandbox`; the Misha package typechecks independently.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details

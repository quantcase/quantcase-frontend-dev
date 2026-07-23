# Getting started

## Prerequisites

- **Node.js 22.x** (developed on 22.13). No version is pinned in `package.json`; use the current LTS.
- **npm** — this repo uses npm (`package-lock.json` is the only lockfile). Do not use pnpm/yarn/bun.
- **A running QuantCase backend** for anything beyond the marketing/landing pages (see
  [Backend](#backend) below). The UI renders without one, but data-driven pages will error.

## Install & run

```bash
npm install        # or `npm ci` for a clean, lockfile-exact install
npm run dev        # start the dev server → http://localhost:3000
```

### Scripts

| Script | Command | Purpose |
|--------|---------|---------|
| `npm run dev` | `next dev` | Local dev server with HMR at `http://localhost:3000`. |
| `npm run build` | `next build` | Production build. |
| `npm run start` | `next start` | Serve a production build (run `build` first). |
| `npm run lint` | `eslint` | Lint with the flat ESLint config. |

There is **no test framework** configured in this repo.

## Backend

The backend base URL is **environment-switched** in [`src/lib/constants.ts`](../src/lib/constants.ts):

```ts
export const BACKEND_URL =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:8000'          // `npm run dev`
    : 'https://api-dev.quantcase.ai';  // production build
```

So in local dev the frontend expects a backend on **`http://localhost:8000`**. Point that at a local
backend, or a tunnel/proxy to a shared one, for data-driven pages to work.

## Environment variables

**None are required.** The app reads only `NODE_ENV` (set automatically by Next.js) — there are no
`NEXT_PUBLIC_*` variables and no `.env` file is needed to boot. All external identifiers are hardcoded
in [`src/lib/constants.ts`](../src/lib/constants.ts): `BACKEND_URL`, `GOOGLE_CLIENT_ID`,
`INTERCOM_APP_ID`, `CLARITY_PROJECT_ID`, `GTM_CONTAINER_ID`, `GSC_VERIFICATION`, and the sample
`CALLS` ids. Change values there, not via env.

> Note: `.gitignore` ignores all `.env*` files, so if you introduce env config it won't be committed
> by default.

## Config file tour

| File | What it configures |
|------|--------------------|
| [`next.config.ts`](../next.config.ts) | Strips `console.*` (except `error`/`warn`) in prod; `optimizePackageImports` for `lucide-react`/`recharts`/`framer-motion`; whitelists the remote image host `qc-backend.mach33.club`. |
| [`tsconfig.json`](../tsconfig.json) | `strict` TS, `moduleResolution: bundler`, and the path alias **`@/* → ./src/*`**. |
| [`eslint.config.mjs`](../eslint.config.mjs) | Flat config extending `eslint-config-next` (core-web-vitals + typescript); ignores `.next/`, `out/`, `build/`. |
| [`postcss.config.mjs`](../postcss.config.mjs) | Single plugin `@tailwindcss/postcss`. **Tailwind v4** is CSS-configured — there is no `tailwind.config.*`; tokens live in [`src/app/globals.css`](../src/app/globals.css). |
| [`components.json`](../components.json) | shadcn/ui config (`new-york` style, RSC, `lucide` icons, css vars). Drives `npx shadcn add`. |

## Where to go next

- Understand the app shape → [Architecture](architecture.md)
- Understand how the UI gets its data → [Data fetching](data-fetching.md)
- Build new UI the right way → [Components](components.md) + [Design system](design-system.md)

# expense-spend — agent notes

A real Hanzo-stack app: log expenses by category and see where money goes.
Vite + React 19 + `@hanzo/gui` (UI) + `@hanzo/iam` (auth) + `@hanzo/base` (data).
Forked from the canonical `hanzo-starter`. Keep it minimal and REAL — every
surface must build and run, no fabricated UI.

## The app

- Three views: **expense log** (add form + tabular ledger) and **spend summary**
  (KPI tiles + by-category proportion bars + by-month bar chart). The signed-out
  landing pitches it with a live sample of the by-category card.
- **One collection**, `expenses(amount, category, note, date)`, org-scoped.
- **Data lifted once**: `src/views/home.tsx` owns the single `useQuery('expenses')`
  and hands rows to both the log and the summary (and the hero total), so there
  is one source of truth. `src/views/log.tsx` owns the create/delete mutations.
- **Domain in one place**: `src/lib/expense.ts` — the `Expense` type, the fixed
  `CATEGORIES` (id + label + accent colour), `money`/`today`/`monthKey`/`monthLabel`
  helpers, and `byCategory`/`byMonth`/`sum` aggregation. No JSX.
- **UI kit in one place**: `src/ui.tsx` — `ink` palette + `Panel`, `Chip`, `Bar`,
  `Action`, `Segmented`, all composed from @hanzo/gui primitives.

## One way, decomplected

- **Providers** (`src/providers.tsx`) mount in the canonical order every Hanzo
  surface ships: `GuiProvider` → `IamProvider` → `BaseProvider`. `BaseProvider`
  gets a `BaseClient` carrying the IAM access token; it is rebuilt when the token
  changes (`src/lib/base.ts` `baseAs`). That single seam is what makes every
  `useQuery`/`useMutation` org-scoped to the signed-in user.
- **Env is one place** (`src/env.ts`), read from `import.meta.env.VITE_*`.
  `CLIENT_ID` falls back to `hanzo-app`.
- **UI is one system** — `@hanzo/gui` primitives only (no second kit, no Tailwind).

## Gotchas (do not regress)

- **`@hanzo/gui` under Vite** needs three things in `vite.config.ts` (it is the
  Tamagui line; the in-browser builder runtime can't do this, which is the whole
  reason this ships as a real repo): (1) alias `react-native` →
  `react-native-web`, (2) `define` `process.env.TAMAGUI_TARGET` / `NODE_ENV` /
  `__DEV__`, (3) `dedupe` react/react-dom/react-native-web. No Tamagui compiler,
  no `one`, no Expo — the optimizer is a perf pass, not a correctness one.
- **`@hanzo/gui` props are Tamagui LONGHAND** with this v5 config:
  `alignItems`/`justifyContent`/`backgroundColor`/`padding`/`alignSelf`/
  `borderRadius`/`textAlign` — NOT the `items`/`justify`/`bg`/`p`/`self`/
  `rounded`/`text` shorthands. Shorthands pass at runtime but FAIL `tsc`.
  `Input` uses `value`/`onChangeText`. The `@hanzogui/button` frame does **not**
  take a text `color` prop — that's why the accent CTA is a pressable stack
  (`Action` in `src/ui.tsx`), not `<Button>`.
- **PKCE storage is `localStorage`** (not sessionStorage) so the verifier/state
  survive the round-trip to hanzo.id.
- **`schema.sql` is the data contract.** It is the `databaseSchema` DDL the
  deploy translates into Base collections (`provisionBaseFromDDL`, rule
  `@request.auth.org_id = org`). Keep it in lockstep with `src/lib/expense.ts`
  and the log/summary views.

## Deploy contract (Hanzo Cloud)

- Static SPA: `npm run build` → `dist/`, served at `<slug>.hanzo.app` from
  object storage (the `*.hanzo.app` published-sites edge). No server process.
- On publish, `schema.sql` → `provisionBaseFromDDL` creates the `expenses`
  collection (org-scoped, IAM-native). Runtime read/write is browser →
  `VITE_HANZO_BASE_URL` with the IAM token.
- **IAM redirect registration** is the one external requirement: the IAM client
  (`VITE_HANZO_CLIENT_ID`, default `hanzo-app`) must allow this origin's
  `/auth/callback`. Production needs a `https://*.hanzo.app/auth/callback`
  wildcard on the shared client (or a per-app `hanzo-expense-spend` client).

## Build

CI (`.github/workflows/ci.yml`) runs `npm ci && npm run typecheck && npm run
build` — build-verification only, NEVER a container image (Hanzo Cloud owns
deploys; do not build images locally). Prove changes with `npm run build`
(tsc + vite).

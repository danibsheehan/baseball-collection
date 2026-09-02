# AGENTS.md

Instructions for any coding agent (Cursor, Claude Code, or otherwise) working in this repo.
Human contributors: see [`README.md`](README.md) instead — this file is written for agents and
skips the narrative tour.

baseball-collection (Cartophiles) is a Vue 3 + Vite SPA (album shell, roster grid, card
flip/tilt/foil, wax-pack deal) with a small Express server that proxies the **MLB Stats API**
and serves `dist` in production.

## Install

```bash
npm install
```

Requires the Node version pinned in `.nvmrc` / `package.json` `engines` (**22**).

## Configure

Nothing is required for local dev. `VITE_API_BASE` (MLB Stats API root) and `VITE_PUBLIC_PATH`
(Vite `base` for GitHub Pages) only matter for a Pages-shaped build — see the
`github-pages-deploy` skill. Client env vars must use the **`VITE_`** prefix; never commit
secrets (`.env*` stay local).

## Run

```bash
npm run dev         # API on :3000 + Vite on :5173 together
npm run api         # API only
npm run dev:client  # Vite only (proxies /teams, /people -> 127.0.0.1:3000)
npm start           # prod-like: Express serves dist + proxy, PORT default 8080
```

## Test

```bash
npm run format:check    # Prettier check (npm run format to fix)
npm run lint            # ESLint on src (.vue, .ts)
npm run test:run        # Vitest, single run
npm run test:coverage   # Vitest with coverage thresholds (matches CI)
npm run build           # Vite production build
npm run build:report    # build + dist size report (scripts/bundle-report.mjs)
```

Before opening or updating a PR, run local CI parity — `format:check` → `lint` → `test:coverage`
→ `build` (see the `pr-ready` skill). For small, localized edits the smallest relevant check is
enough (see `definition-of-done`); full coverage isn't required for every tweak.

## Layout

- **UI**: `src/` — `main.ts`, `App.vue`, `components/*.vue`, shared logic in `src/lib/` (`.ts`,
  tests as `*.test.ts`).
- **Global look**: `src/styles/tokens.css`; team themes in `src/styles/team-themes.css`
  (`[data-theme]` on **BaseballCard**).
- **HTTP**: `src/http-common.ts` (Axios + short-lived cache); `src/lib/rosterPeople.ts` batches
  people for card backs.
- **API**: `server.js` + validation under `lib/` — details in skill `api-proxy-hardening`.
- **Tooling**: `vite.config.mjs` (Vue, Vitest `environment: 'node'`, dev proxy to
  `127.0.0.1:3000` for `/teams` and `/people`).

## Conventions

- Match nearby Vue SFC patterns (`PlayerInfo.vue`, `BaseballCard.vue`).
- Non-trivial logic in `src/lib/` or `lib/`: add or extend Vitest coverage.

Step-by-step playbooks live in `.claude/skills/*/SKILL.md` (canonical — add new skills here;
`.cursor/skills` is a symlink to it, kept for compatibility with the legacy Cursor setup),
auto-invoked by task:

- `definition-of-done` / `pr-ready` — validate a task, or prepare a PR (CI-parity checks, PR
  template)
- `api-proxy-hardening` — Express proxy (`server.js`), validation (`lib/`), CORS/cache, the
  three-mode `VITE_API_BASE` behavior
- `github-pages-deploy` — Pages base path, `VITE_*` CI parity, release flow
- `test-generator` — Vitest for Vue/TS
- `accessibility-a11y` — keyboard, ARIA, reduced motion
- `bundle-performance` — size report, Lottie/chunk weight
This repo also installs the `foundations` plugin from the `dani-foundations` marketplace
(see `.claude/settings.json`), providing `doc-writer`, `dependabot-triage`,
`pr-summary-draft`, and `coverage-gap-diagnosis` (namespaced `foundations:*`) — no local
copies of these needed; each is generic enough on its own, verified against this repo's
`AGENTS.md`/`tokens.css` before removing the local duplicates.

## Constraints — do not

- **Concatenate raw request input into MLB proxy paths.** Build `relativePath` from fixed
  templates plus validated params only — see `api-proxy-hardening` (SSRF risk otherwise).
- **Assume `server.js` exists in production.** GitHub Pages serves the SPA statically with no
  Express proxy; the browser calls MLB directly via `VITE_API_BASE`.
- **Add unsolicited README/docs changes or drive-by refactors** on unrelated code — keep diffs
  focused.
- **Commit secrets** (`.env*`, credentials).
- **Amend or force-push**, or **open/push/merge a PR**, unless the user explicitly asks. (See
  README's **Automation** section for this repo's one standing exception — grouped Dependabot
  auto-merge — and the read-only, cross-repo `weekly-project-update` routine, defined in
  `danibsheehan/portfolio-automation`, that opens PRs _elsewhere_, never here.)

## Definition of done

- **Task done**: follow the skill for files touched; run the smallest relevant check. For
  substantive edits (Vue, TypeScript, styles, server/proxy, config), run `format:check` → `lint`
  → `test:run` → `build` (`definition-of-done` skill). Full CI is not required for every small
  edit.
- **PR done**: `format:check`, `lint`, `test:coverage`, `build` all green (`pr-ready` skill);
  Pages-shaped build too if deploy/base/API env changed. Commit, push, or open a PR only when the
  user asks.

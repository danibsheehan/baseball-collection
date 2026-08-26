<div align="center">

# CARTOPHILES

**Card album · Clubs · Late-50s gum card chrome**

</div>

**╔══════════════════════════════════════════════════════════════════════════╗**  
**║** `░░` **MLB STATS API** `░░` **VUE 3** `░░` **VITE** `░░` **EXPRESS PROXY** `░░` **║**  
**║** `░░` **NEWSPRINT STOCK · NAVY + CRIMSON RULES · FELT INFIELD** `░░` **║**  
**╠══════════════════════════════════════════════════════════════════════════╣**  
**║** woodcut masthead · wax-pack picker · binder page · flip / tilt / foil **║**  
**║** Newsreader / Oswald / Bebas / Archivo — tokens in `src/styles/tokens.css` **║**  
**╚══════════════════════════════════════════════════════════════════════════╝**

Vue 3 — composition + SFCs · Vite — dev + build · Express — `server.js` proxy + static `dist` · MLB Stats API — `statsapi.mlb.com` · Vitest — unit tests by source

**PICK A CLUB → LOAD THE ACTIVE ROSTER → DEAL THE GRID → FLIP FOR THE BACK.**  
_Wax pack + peel when motion is on; `prefers-reduced-motion` jumps straight to a quiet grid._  
Same public feed for teams, roster, and player lines — errors stay visible, no mystery blank states.

## Contents

- [What this is](#what-this-is)
- [What's in the box](#whats-in-the-box)
- [Prerequisites](#prerequisites)
- [Run it locally](#run-it-locally)
- [Configuration](#configuration)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [Automation](#automation)

Deeper technical detail — project layout, the full script list, API routes, performance internals — lives in collapsible **"for builders"** sections inline, right where each topic comes up.

## Start here

| I want to…                  | Go here                                |
| --------------------------- | -------------------------------------- |
| See what it does            | [What's in the box](#whats-in-the-box) |
| Run it locally              | [Run it locally](#run-it-locally)      |
| Configure env vars          | [Configuration](#configuration)        |
| Deploy it                   | [Deployment](#deployment)              |
| Contribute a change         | [Contributing](#contributing)          |
| Understand what's automated | [Automation](#automation)              |

## What this is

> **Vue 3** SPA: `App.vue` is the whole **album shell** (masthead, clubs rail, felt, binder, roster deal). **Axios** + cache adapter batch `GET /people?personIds=…` for card backs. **Global look** lives in `src/styles/tokens.css` (newsprint, letterpress rules, album layers, card sheen) and `src/styles/team-themes.css` (`[data-theme]` on each **BaseballCard**). **`prefers-reduced-motion: reduce`** skips pack Lottie load + flying peel; short opacity fades only — same spirit as the arcade README, but the volume knob is **stadium organ**, not neon.
>
> **Dev** hits the API through **same-origin** `/teams` and `/people` via Vite → Express. **Production / Pages** can point `VITE_API_BASE` straight at MLB when CORS allows.

<details>
<summary><strong>Full light-mode palette</strong> (for builders)</summary>

**Extra ink rows — light `:root` in `tokens.css` (dark remaps in the same file):**

| CSS variable          | Hex / value | Where it reads                                     |
| --------------------- | ----------- | -------------------------------------------------- |
| `--color-paper-gloss` | `#faf4e8`   | Cream gloss on edges, focus ring anchor            |
| `--color-surface`     | `#e8dfc8`   | Newsprint page stock                               |
| `--color-text`        | `#1c1917`   | Body ink                                           |
| `--color-text-muted`  | `#5a4f42`   | Sepia second read                                  |
| `--color-ui-ink`      | `#0f172a`   | Navy letterpress / UI chrome                       |
| `--color-ui-crimson`  | `#b91c1c`   | Margin rules, pennant strip, "second color" accent |
| `--color-ui-gum`      | `#1e3a5f`   | Gum-card navy accent                               |
| `--album-masthead-bg` | `#f7f0e2`   | Masthead band behind the woodcut title             |
| `--album-rail-paper`  | `#f0e6d4`   | Checklist rail stock                               |
| `--album-felt-base`   | `#d9e4d6`   | Infield felt under the binder                      |
| `--card-back-paper`   | `#ebe0cd`   | Warm buff card reverse                             |

_Painted chips are only in the image below—the big `╔══╗` "program" frame at the top of this README is plain Markdown text and `░░` characters, not a color graphic._

![Cartophiles light :root palette: eleven paper and ink swatches left to right](./docs/readme-ui-palette.svg)

Per-franchise caps and fields: `--theme-*` in `src/styles/team-themes.css`. **Update this table and [`docs/readme-ui-palette.svg`](./docs/readme-ui-palette.svg) whenever you change light `:root` hex values** (same order left → right in the strip) so the README stays honest with the UI—same pattern as [gotta-catch-em-all](https://github.com/danibsheehan/gotta-catch-em-all) (`docs/readme-ui-palette.svg`). If the image ever breaks in preview, confirm the SVG is **valid UTF-8 XML** (no stray bytes in text nodes).

</details>

<details>
<summary><strong>Project layout</strong> — where each folder points (for builders)</summary>

| ZONE            | PATH                                                                                                                   |
| --------------- | ---------------------------------------------------------------------------------------------------------------------- |
| **SHELL**       | `App.vue` — masthead, team nav, binder, deal phases, live region                                                       |
| **BOOT**        | `main.ts` — mounts Vue, imports global CSS                                                                             |
| **GLOBAL LOOK** | `src/styles/tokens.css` (stock, rules, album, card polish); `src/styles/team-themes.css` (franchise themes)            |
| **TEAMS**       | `components/Team.vue`; `lib/filterMlbTeams.ts`; `lib/teamPickerSections.ts`                                            |
| **CLUB URL**    | `lib/teamUrlState.ts` — `?team=` History API deep links                                                                |
| **LOCAL ALBUM** | `lib/albumCollection.ts` — `localStorage` collect + owned-vs-roster completeness                                       |
| **ROSTER LOAD** | `lib/rosterLoad.ts` — enriched roster fetch for the deal                                                               |
| **CARDS**       | `components/BaseballCard.vue`, `CardFront.vue`, `CardBack.vue`, `CardFoilGl.vue` + `Player*.vue`                       |
| **MOTION / FX** | `lib/useCardTilt.ts`, `lib/useBinderPennantParallax.ts`, `lib/cardFoilBridge.ts`, `cardFoilDom.ts`, `cardFoilWebgl.ts` |
| **PACK / DEAL** | `components/AlbumPackLottie.vue`; deal + roster animation orchestration in `App.vue`                                   |
| **HTTP**        | `http-common.ts` (Axios + cache); `lib/rosterPeople.ts` (batch people for backs)                                       |
| **API**         | `server.js` — Express proxy + static; path validation under `lib/`                                                     |

</details>

## What's in the box

| TAG                 | WHAT HAPPENS                                                                                                           |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| **CLUBS**           | MLB teams filtered to `sport.name === 'Major League Baseball'`; AL / NL sections + search; per-club album count badges |
| **SHAREABLE CLUB**  | `?team=<teamCode>` deep links (History API); refresh / share / back-forward restore the club                           |
| **LOCAL ALBUM**     | Collect cards in the browser (`localStorage`); completeness is owned vs roster; All cards / In album filter            |
| **ROSTER GRID**     | One **1959-style** card per active player; team crest + theme on the front                                             |
| **FLIP**            | Click / keyboard flip; back pulls bat/ball stats lines from batched people payload                                     |
| **TILT + FOIL**     | Pointer tilt on the scene; optional WebGL foil path on a single "chase" card target                                    |
| **WAX PACK**        | Lottie unwrap + peel deal when motion is allowed; instant static grid when reduced                                     |
| **BATCH PEOPLE**    | Up to **50** IDs per `GET /people?personIds=…` (proxy also accepts `ids`)                                              |
| **CACHE**           | Short-lived Axios cache adapter on the client                                                                          |
| **DARK NIGHT GAME** | `prefers-color-scheme: dark` retints `:root` in `tokens.css` (warmer cards under "lights")                             |

> **Product note:** Club URLs are shareable; your album stays on-device only (no account / database). Sharing `?team=bos` opens the Red Sox cards — not someone else's collection.

## Prerequisites

| REQUIREMENT    | NOTES                                                         |
| -------------- | ------------------------------------------------------------- |
| **Node.js 22** | Matches `.nvmrc`, `package.json` `engines`, and CI workflows. |

## Run it locally

### Clone the repo

```bash
git clone https://github.com/danibsheehan/baseball-collection.git
cd baseball-collection
npm ci
```

**Dev — proxy + Vite (recommended)**

```bash
npm run dev
```

→ **http://localhost:5173** (Vite; API proxied to **port 3000**)

**Dev — client only** (proxy already running elsewhere)

```bash
npm run dev:client
```

**Prod build**

```bash
npm run build
```

**Prod build + bundle report**

```bash
npm run build:report
```

**Preview static build** (`VITE_API_BASE` baked at build time)

```bash
npm run preview
```

**Serve `dist` + proxy routes** (Express)

```bash
npm start
```

<details>
<summary><strong>All npm scripts</strong>, decoded (for builders)</summary>

| SCRIPT                        | WHAT IT DOES                                                |
| ----------------------------- | ----------------------------------------------------------- |
| `npm run dev`                 | `concurrently`: `npm run api` (**3000**) + Vite dev server  |
| `npm run dev:client`          | Vite only                                                   |
| `npm run api`                 | Express proxy on **PORT=3000**                              |
| `npm run build`               | `vite build` → `dist/`                                      |
| `npm run build:report`        | Build then `scripts/bundle-report.mjs`                      |
| `npm run preview`             | `vite preview`                                              |
| `npm start`                   | `node server.js` — static `dist` + proxy (**8080** default) |
| `npm run lint`                | ESLint on `src` (`.vue`, `.ts`)                             |
| `npm run format`              | Prettier — write formatting fixes                           |
| `npm run format:check`        | Prettier — check formatting only                            |
| `npm run test`                | Vitest watch                                                |
| `npm run test:run`            | Vitest single run                                           |
| `npm run test:coverage`       | Coverage run (thresholds per config)                        |
| `npm run test:coverage:watch` | Coverage run, watch mode                                    |
| `npm run heroku-postbuild`    | Heroku: dev deps + `npm run build`                          |

</details>

<details>
<summary><strong>API routes</strong> — browser → origin (for builders)</summary>

In development, Vite proxies `/teams` and `/people` to `server.js`. On GitHub Pages, `VITE_API_BASE` can point at MLB directly.

| Path                              | Purpose                                                                           |
| --------------------------------- | --------------------------------------------------------------------------------- |
| `GET /teams`                      | MLB teams collection (app keeps `sport.name === 'Major League Baseball'`)         |
| `GET /teams/:teamId/roster`       | Active roster for one team                                                        |
| `GET /people?personIds=id1,id2,…` | Batched player records for card backs (comma-separated; proxy also accepts `ids`) |
| `GET /people/:playerId`           | Single player record (proxy only; SPA prefers batching)                           |

Upstream: **MLB Stats API** — `https://statsapi.mlb.com/api/v1/`. Response shapes match that API.

</details>

## Configuration

| FIELD              | WHERE  | DESCRIPTION                                                                                                |
| ------------------ | ------ | ---------------------------------------------------------------------------------------------------------- |
| `VITE_API_BASE`    | env    | Full MLB Stats API root, e.g. `https://statsapi.mlb.com/api/v1`. Empty in dev → `location.origin` + proxy. |
| `VITE_PUBLIC_PATH` | env    | Vite `base`; `/repository-name/` for GitHub project Pages.                                                 |
| `PORT`             | env    | `server.js` listen port (`8080` default for `npm start`).                                                  |
| `npm run api`      | script | Forces **3000** for local proxy.                                                                           |

## Deployment

| TARGET           | NOTES                                                                                                                      |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------- |
| **GitHub Pages** | `.github/workflows/deploy-pages.yml` — `npm ci`, `npm run build` with `VITE_API_BASE` + `VITE_PUBLIC_PATH`, deploy `dist/` |
| **Heroku**       | `heroku-postbuild` builds; web process = `npm start`                                                                       |

## Contributing

```bash
npm run format:check
npm run lint
npm run test:coverage
npm run build
```

Tests live next to sources: `src/**/*.test.ts`, `lib/**/*.test.mjs` (see `vite.config.mjs`).

## Automation

**In plain English:** one narrow decision merges itself (a Dependabot patch/minor bump once CI
is green); everything else — triage, docs, features — is a person or an AI assistant doing work
someone asked for, reviewed before it ships.

- **Auto-merge** ([`dependabot-auto-merge.yml`](.github/workflows/dependabot-auto-merge.yml)) —
  merges the grouped `npm-minor-and-patch` Dependabot PR once required checks pass. Same scoping
  as `caught-looking`'s equivalent workflow. Ungrouped npm bumps (majors), GitHub Actions bumps,
  and anything CI doesn't clear stay manual.
- **`dependabot-triage`** skill — ported from `caught-looking`, available on request to classify
  the Dependabot backlog by risk. Not on a schedule here yet — run it manually when the backlog
  needs a look.
- **CodeQL / security scanning** — not configured in this repo yet.
- **Cross-repo, read-only**: a scheduled Claude Code routine, defined in
  [`danibsheehan/portfolio-automation`](https://github.com/danibsheehan/portfolio-automation)'s
  [`weekly-project-update`](https://github.com/danibsheehan/portfolio-automation/blob/main/.cursor/skills/weekly-project-update/SKILL.md)
  skill, reads this repo once a week (never writes to it) and — only when there's something
  people-relevant to report — opens a PR against
  [danibsheehan.github.io](https://github.com/danibsheehan/danibsheehan.github.io) updating this
  project's page. See
  [`portfolio-automation`'s README](https://github.com/danibsheehan/portfolio-automation#autonomy-boundary)
  for the full autonomy boundary (it opens, never merges).

<details>
<summary><strong>Performance & motion internals</strong> (for builders)</summary>

1. **Lighthouse** — Performance (mobile + desktop): LCP, TBT, dependency tree.
2. **Network** — Hard reload, pick a team: batched `GET /people?personIds=…` (or MLB URL in prod), not N single-player calls. Headshots lazy as cards approach viewport.
3. **Coverage** — Compare JS/CSS at first paint vs after use.
4. **Vue DevTools** — Flip cards, switch teams; watch re-renders on large lists.
5. **Repeat visits** — Static assets `304` / memory cache; API `Cache-Control` from `server.js` when proxied.

### Motion, accessibility, and animation cost

- **`prefers-reduced-motion`** — Deal **skips** pack Lottie + flying peel (`dealPhase` → `static`). Pack JSON **does not load**; Lottie player never spins up. Cards region: **~220ms** opacity fade; pennant / completeness use opacity keyframes, not big translate/scale entrances.
- **Layout / compositing** — `measureAlbumRevealOffsets` once per deal: batch reads, then per-card custom properties. **`will-change: transform`** only while `.album__card-deal--animate`; back to `auto` when settled. Peel avoids animating `filter: blur`.
- **Large rosters (>30)** — Shorter peel, capped stagger, smaller fly vectors / fan angles (`getRevealTiming` / `measureAlbumRevealOffsets`), denser `--shadow-card-large-roster`.

</details>

**╔══════════════════════════════════════════════════════════╗**  
**║** **ATTRIBUTIONS** — palette reference: [U.S. Team Colors](https://usteamcolors.com/). **║**  
**║** Team names, colors, and logos belong to their owners. **║**  
**║** Not affiliated with MLB or any club. **║**  
**╚══════════════════════════════════════════════════════════╝**

**╔══════════════════════════════════════════════════════════╗**  
**║** **LICENSE:** MIT — see [`LICENSE`](LICENSE). **║**  
**╚══════════════════════════════════════════════════════════╝**

_KEEP THE ALBUM SPINE STRAIGHT · PLAY BALL_

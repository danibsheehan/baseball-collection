<div align="center">

# CARTOPHILES

**Pasteboard album · Club checklist · Late-50s gum card chrome**

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

```
▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
```

## ⚾ PROGRAM NOTES — **what this is, fast**

> **Vue 3** SPA: `App.vue` is the whole **album shell** (masthead, checklist rail, felt, binder, roster deal). **Axios** + cache adapter batch `GET /people?personIds=…` for card backs. **Global look** lives in `src/styles/tokens.css` (newsprint, letterpress rules, album layers, card sheen) and `src/styles/team-themes.css` (`[data-theme]` on each **BaseballCard**). **`prefers-reduced-motion: reduce`** skips pack Lottie load + flying peel; short opacity fades only — same spirit as the arcade README, but the volume knob is **stadium organ**, not neon.
>
> **Dev** hits the API through **same-origin** `/teams` and `/people` via Vite → Express. **Production / Pages** can point `VITE_API_BASE` straight at MLB when CORS allows.

**▼ Extra ink rows — light `:root` in `tokens.css` (dark remaps in the same file) ▼**

| CSS variable | Hex / value | Where it reads |
| ------------ | ----------- | ---------------- |
| `--color-paper-gloss` | `#faf4e8` | Cream gloss on edges, focus ring anchor |
| `--color-surface` | `#e8dfc8` | Newsprint page stock |
| `--color-text` | `#1c1917` | Body ink |
| `--color-text-muted` | `#5a4f42` | Sepia second read |
| `--color-ui-ink` | `#0f172a` | Navy letterpress / UI chrome |
| `--color-ui-crimson` | `#b91c1c` | Margin rules, pennant strip, “second color” accent |
| `--color-ui-gum` | `#1e3a5f` | Gum-card navy accent |
| `--album-masthead-bg` | `#f7f0e2` | Masthead band behind the woodcut title |
| `--album-rail-paper` | `#f0e6d4` | Checklist rail stock |
| `--album-felt-base` | `#d9e4d6` | Infield felt under the binder |
| `--card-back-paper` | `#ebe0cd` | Warm buff card reverse |

_Painted chips are only in the image below—the big `╔══╗` “program” frame at the top of this README is plain Markdown text and `░░` characters, not a color graphic._

![Cartophiles light :root palette: eleven paper and ink swatches left to right](./docs/readme-ui-palette.svg)

Per-franchise caps and fields: `--theme-*` in `src/styles/team-themes.css`. **Update this table and [`docs/readme-ui-palette.svg`](./docs/readme-ui-palette.svg) whenever you change light `:root` hex values** (same order left → right in the strip) so the README stays honest with the UI—same pattern as [gotta-catch-em-all](https://github.com/danibsheehan/gotta-catch-em-all) (`docs/readme-ui-palette.svg`). If the image ever breaks in preview, confirm the SVG is **valid UTF-8 XML** (no stray bytes in text nodes).

```
▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
```

## ⚾ DUGOUT MAP — **where each folder points**

| ZONE | PATH |
| ---- | ---- |
| **SHELL** | `App.vue` — masthead, team nav, binder, deal phases, live region |
| **BOOT** | `main.ts` — mounts Vue, imports global CSS |
| **GLOBAL LOOK** | `src/styles/tokens.css` (stock, rules, album, card polish); `src/styles/team-themes.css` (franchise themes) |
| **TEAMS** | `components/Team.vue`; `lib/filterMlbTeams.ts`; `lib/teamPickerSections.ts` |
| **CARDS** | `components/BaseballCard.vue`, `CardFront.vue`, `CardBack.vue`, `CardFoilGl.vue` + `Player*.vue` |
| **MOTION / FX** | `lib/useCardTilt.ts`, `lib/useBinderPennantParallax.ts`, `lib/cardFoilBridge.ts`, `cardFoilDom.ts`, `cardFoilWebgl.ts` |
| **PACK / DEAL** | `components/AlbumPackLottie.vue`; deal + roster animation orchestration in `App.vue` |
| **HTTP** | `http-common.ts` (Axios + cache); `lib/rosterPeople.ts` (batch people for backs) |
| **API** | `server.js` — Express proxy + static; path validation under `lib/` |

```
▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
```

## ⚾ FEATURE ROLL CALL — **what ships in the box**

| TAG | WHAT HAPPENS |
| --- | ------------ |
| **CLUB CHECKLIST** | MLB teams filtered to `sport.name === 'Major League Baseball'`; AL / NL sections + search |
| **ROSTER GRID** | One **1959-style** card per active player; team crest + theme on the front |
| **FLIP** | Click / keyboard flip; back pulls bat/ball stats lines from batched people payload |
| **TILT + FOIL** | Pointer tilt on the scene; optional WebGL foil path on a single “chase” card target |
| **WAX PACK** | Lottie unwrap + peel deal when motion is allowed; instant static grid when reduced |
| **BATCH PEOPLE** | Up to **50** IDs per `GET /people?personIds=…` (proxy also accepts `ids`) |
| **CACHE** | Short-lived Axios cache adapter on the client |
| **DARK NIGHT GAME** | `prefers-color-scheme: dark` retints `:root` in `tokens.css` (warmer cards under “lights”) |

```
▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
```

## ⚾ PREREQS — **install first**

| REQUIREMENT | NOTES |
| ----------- | ----- |
| **Node.js 22** | Matches `.nvmrc`, `package.json` `engines`, and CI workflows. |

```
▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
```

## ⚾ INSTALL · RUN · SHIP — **clone, dev, build**

### ═══ GRAB THE REPO ═══

```bash
git clone https://github.com/danibsheehan/baseball-collection.git
cd baseball-collection
npm ci
```

**DEV — PROXY + VITE (RECOMMENDED)**

```bash
npm run dev
```

→ **http://localhost:5173** (Vite; API proxied to **port 3000**)

**DEV — CLIENT ONLY** (proxy already running elsewhere)

```bash
npm run dev:client
```

**PROD BUILD**

```bash
npm run build
```

**PROD BUILD + BUNDLE REPORT**

```bash
npm run build:report
```

**PREVIEW STATIC BUILD** (`VITE_API_BASE` baked at build time)

```bash
npm run preview
```

**SERVE `dist` + PROXY ROUTES** (Express)

```bash
npm start
```

```
▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
```

## ⚾ SCRIPTS — **npm, decoded**

| SCRIPT | WHAT IT DOES |
| ------ | -------------- |
| `npm run dev` | `concurrently`: `npm run api` (**3000**) + Vite dev server |
| `npm run dev:client` | Vite only |
| `npm run api` | Express proxy on **PORT=3000** |
| `npm run build` | `vite build` → `dist/` |
| `npm run build:report` | Build then `scripts/bundle-report.mjs` |
| `npm run preview` | `vite preview` |
| `npm start` | `node server.js` — static `dist` + proxy (**8080** default) |
| `npm run lint` | ESLint on `src` (`.vue`, `.ts`) |
| `npm run test` | Vitest watch |
| `npm run test:run` | Vitest single run |
| `npm run test:coverage` | Coverage run (thresholds per config) |
| `npm run heroku-postbuild` | Heroku: dev deps + `npm run build` |

```
▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
```

## ⚾ API ROUTES — **browser → origin**

In development, Vite proxies `/teams` and `/people` to `server.js`. On GitHub Pages, `VITE_API_BASE` can point at MLB directly.

| Path | Purpose |
| ---- | ------- |
| `GET /teams` | MLB teams collection (app keeps `sport.name === 'Major League Baseball'`) |
| `GET /teams/:teamId/roster` | Active roster for one team |
| `GET /people?personIds=id1,id2,…` | Batched player records for card backs (comma-separated; proxy also accepts `ids`) |
| `GET /people/:playerId` | Single player record (proxy only; SPA prefers batching) |

Upstream: **MLB Stats API** — `https://statsapi.mlb.com/api/v1/`. Response shapes match that API.

```
▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
```

## ⚾ CONFIGURATION — **Vite + server**

| FIELD | WHERE | DESCRIPTION |
| ----- | ----- | ----------- |
| `VITE_API_BASE` | env | Full MLB Stats API root, e.g. `https://statsapi.mlb.com/api/v1`. Empty in dev → `location.origin` + proxy. |
| `VITE_PUBLIC_PATH` | env | Vite `base`; `/repository-name/` for GitHub project Pages. |
| `PORT` | env | `server.js` listen port (`8080` default for `npm start`). |
| `npm run api` | script | Forces **3000** for local proxy. |

```
▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
```

## ⚾ DEPLOYMENT — **where it lands**

| TARGET | NOTES |
| ------ | ----- |
| **GitHub Pages** | `.github/workflows/deploy-pages.yml` — `npm ci`, `npm run build` with `VITE_API_BASE` + `VITE_PUBLIC_PATH`, deploy `dist/` |
| **Heroku** | `heroku-postbuild` builds; web process = `npm start` |

```
▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
```

## ⚾ CONTRIBUTING — **lint + test**

```bash
npm run lint
npm run test:run
```

Tests live next to sources: `src/**/*.test.ts`, `lib/**/*.test.mjs` (see `vite.config.mjs`).

```
▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
```

## ⚾ PERFORMANCE CHECKLIST — **optional, for regressions**

1. **Lighthouse** — Performance (mobile + desktop): LCP, TBT, dependency tree.
2. **Network** — Hard reload, pick a team: batched `GET /people?personIds=…` (or MLB URL in prod), not N single-player calls. Headshots lazy as cards approach viewport.
3. **Coverage** — Compare JS/CSS at first paint vs after use.
4. **Vue DevTools** — Flip cards, switch teams; watch re-renders on large lists.
5. **Repeat visits** — Static assets `304` / memory cache; API `Cache-Control` from `server.js` when proxied.

### Motion, accessibility, and animation cost

- **`prefers-reduced-motion`** — Deal **skips** pack Lottie + flying peel (`dealPhase` → `static`). Pack JSON **does not load**; Lottie player never spins up. Cards region: **~220ms** opacity fade; pennant / completeness use opacity keyframes, not big translate/scale entrances.
- **Layout / compositing** — `measureAlbumRevealOffsets` once per deal: batch reads, then per-card custom properties. **`will-change: transform`** only while `.album__card-deal--animate`; back to `auto` when settled. Peel avoids animating `filter: blur`.
- **Large rosters (>30)** — Shorter peel, capped stagger, smaller fly vectors / fan angles (`getRevealTiming` / `measureAlbumRevealOffsets`), denser `--shadow-card-large-roster`.

```
██████████████████████████████████████████████████████████████████████████████
```

**╔══════════════════════════════════════════════════════════╗**  
**║** **ATTRIBUTIONS** — palette reference: [U.S. Team Colors](https://usteamcolors.com/). **║**  
**║** Team names, colors, and logos belong to their owners. **║**  
**║** Not affiliated with MLB or any club. **║**  
**╚══════════════════════════════════════════════════════════╝**

**╔══════════════════════════════════════════════════════════╗**  
**║** **LICENSE:** no `LICENSE` file in-repo yet. **║**  
**║** Add one when you want explicit terms. **║**  
**╚══════════════════════════════════════════════════════════╝**

_KEEP THE ALBUM SPINE STRAIGHT · PLAY BALL_

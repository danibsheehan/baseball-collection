# Cartophiles

> Browse MLB rosters and flip styled baseball cards for active players—built as a Vue 3 single-page app.

## Overview

Cartophiles loads Major League Baseball teams, lets you pick one, and renders the active roster as collectible-style cards. Player details on the card back come from the same public stats feed as teams and rosters. Team colors and logos follow franchise styling; data is live from MLB’s API.

## Features

- Lists MLB teams and filters to the major-league sport only
- Fetches a team roster on demand and shows one card per player
- Card front/back UI with team-themed styling
- Axios client with a short-lived cache adapter; roster loads batch `GET /people?personIds=…` (up to 50 IDs per request)
- Production builds call the MLB Stats API from the browser (CORS-friendly)
- Local development uses an Express proxy so the SPA uses same-origin URLs

## Installation

```bash
git clone https://github.com/danibsheehan/baseball-collection.git
cd baseball-collection
npm ci
```

Requires **Node.js 20** (matches `.github/workflows/deploy-pages.yml`).

## Quick Start

**Development** — two terminals:

```bash
# Terminal 1 — Express proxy on port 3000 (forwards to MLB Stats API)
npm run api

# Terminal 2 — Vite dev server (proxies /teams and /people to the proxy)
npm run dev
```

Open the URL from `npm run dev` (usually `http://localhost:5173`).

**Production-style build** — set the client API root (see `.env.production`), then:

```bash
npm run build
```

**Built assets + size report:**

```bash
npm run build:report
```

**Preview the static build** (uses `VITE_API_BASE` baked in at build time):

```bash
npm run preview
```

To serve `dist` with the Express proxy routes (`/teams`, `/people`, …), use `npm start` instead of `preview`.

## API Reference

The browser calls these paths relative to the app origin. In development, Vite proxies them to `server.js`. On GitHub Pages, `VITE_API_BASE` points requests at MLB directly.

| Path | Purpose |
|------|---------|
| `GET /teams` | MLB teams collection (app keeps `sport.name === 'Major League Baseball'`) |
| `GET /teams/:teamId/roster` | Active roster for one team |
| `GET /people?personIds=id1,id2,…` | Batched player records for card backs (comma-separated IDs; proxy also accepts `ids`) |
| `GET /people/:playerId` | Single player record (proxy only; the SPA uses batching) |

Upstream: **MLB Stats API** — `https://statsapi.mlb.com/api/v1/`. Response shapes match that API.

## Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `VITE_API_BASE` | string | *(empty in dev)* | Full MLB Stats API root, e.g. `https://statsapi.mlb.com/api/v1`. When unset, the client uses `location.origin` and relies on the dev proxy or Express routes. |
| `VITE_PUBLIC_PATH` | string | `/` | Vite `base`; use `/repository-name/` for GitHub project Pages. |
| `PORT` | number | `8080` | Port for `server.js` when using `npm start`. |
| `npm run api` | — | `3000` | Sets `PORT=3000` for the local proxy used with `npm run dev`. |

## Deployment

- **GitHub Pages**: `.github/workflows/deploy-pages.yml` runs `npm ci`, `npm run build` with `VITE_API_BASE` and `VITE_PUBLIC_PATH`, then deploys `dist`.
- **Heroku**: `package.json` defines `heroku-postbuild` to install dev dependencies and build; use `npm start` as the web process for a Node deploy.

## Contributing

```bash
npm run lint
```

## Performance checklist (optional)

Use when checking load time, network cost, or regressions.

1. **Lighthouse (Chrome DevTools)** — Run *Performance* (mobile + desktop). Note LCP, TBT, and the network dependency tree.
2. **Network** — Disable cache, hard reload, pick a team: confirm batched `GET /people?personIds=…` (or the equivalent MLB URL in production), not many single-player calls. Confirm headshot requests start as cards approach the viewport.
3. **Coverage (optional)** — *More tools → Coverage*: record a session and compare JS/CSS used at first paint vs after use.
4. **Vue DevTools** — Flip cards and switch teams; avoid excessive re-renders on large lists.
5. **Repeat visits** — With cache on, static assets should be `304` or memory-cached; API responses may reflect `Cache-Control` from `server.js` when using the proxy.

**Serve built app with Express** (static `dist` plus proxy):

```bash
npm start
```

## Screenshots

<img src="./src/assets/CartophilesHome.png" width="250" alt="Home screen"/> <img src="./src/assets/CartophilesTeam.png" width="250" alt="Team selection"/> <img src="./src/assets/CartophilesCard.png" width="250" alt="Sample card"/>

## Attributions & disclaimer

Team colors and logo treatments draw on reference material from [U.S. Team Colors](https://usteamcolors.com/). Team names, colors, and logos belong to their respective owners; this project is not affiliated with MLB or any club.

## License

No `LICENSE` file is in this repository yet; add one if you want explicit terms.

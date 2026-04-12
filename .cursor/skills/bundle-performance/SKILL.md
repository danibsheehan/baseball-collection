---
name: bundle-performance
description: >
  Bundle size, Vite production output, and runtime performance for this Vue app.
  Use when the user asks about bundle size, gzip, code splitting, lazy loading,
  Lottie or asset weight, Lighthouse, Core Web Vitals, network waterfalls,
  `build:report`, `scripts/bundle-report.mjs`, or reducing JS/CSS cost.
---

# Bundle and performance (baseball-collection)

## Bundle size (CLI)

1. **Production build** — `npm run build` writes `dist/` (Vite; see `vite.config.mjs`).
2. **Size report** — `npm run build:report` runs **`vite build`** then **`node scripts/bundle-report.mjs`**, which lists `dist/assets/*` with **raw** and **gzip** kB (largest first) plus **index.html** in the total.

Use `build:report` after dependency upgrades, new libraries, or large assets. Compare before/after on the same machine; note **chunk file names** are hashed—compare **sizes and row counts**, not filenames.

3. **GitHub Pages–shaped build** — For numbers that match production Pages, build with the same **`VITE_PUBLIC_PATH`** and **`VITE_API_BASE`** as CI (see skill **`github-pages-deploy`**) before running `node scripts/bundle-report.mjs` (or run `npm run build:report` with those env vars set).

## What usually dominates this repo

- **Vue** + **axios** / **axios-extensions** — core app weight.
- **`lottie-web`** + **`public/lottie/baseball-pack.json`** — animation cost; reduced-motion path should avoid loading the player/JSON (see README “Motion, accessibility, and animation cost”).
- **Images** — MLB headshots and UI assets; prefer lazy or viewport-driven loading where the code already defers work.

Prefer **dynamic `import()`** for heavy, rarely used modules instead of adding them to the main graph. Avoid new top-level dependencies without checking `build:report`.

## Runtime checks (browser)

The **Performance checklist** in `README.md` is the canonical list: Lighthouse (LCP, TBT), Network panel (batched `/people?personIds=…`, headshots), optional Coverage, Vue DevTools for re-renders, repeat visits for caching.

When investigating **jank or paint cost**, read the same README subsection on **`prefers-reduced-motion`**, **`measureAlbumRevealOffsets`**, **`will-change`**, and large-roster tuning (`getRevealTiming` / related helpers in the album deal flow).

## Guardrails

- Do not trade correctness for size without tests (`npm run test:run`) where logic changes.
- After meaningful bundle or import changes, run **`npm run build`** or **`npm run build:report`** and spot-check **`npm run preview`** (or CI-shaped preview for Pages).

---
name: github-pages-deploy
description: >
  GitHub Pages deploy and release for this Vue/Vite repo (project site at
  https://<user>.github.io/<repo>/). Use when the user asks about deployment,
  releases, GitHub Actions Pages, VITE_PUBLIC_PATH, VITE_API_BASE, previewing a
  production build under a subpath, or fixing broken assets on Pages.
---

# GitHub Pages deploy (baseball-collection)

Same pattern as **danibsheehan/gotta-catch-em-all**: a **GitHub project site** lives at `https://<user>.github.io/<repository-name>/`. That repo uses Angular’s `npm run build:github-pages` for base href; **here**, Vite reads **`VITE_PUBLIC_PATH`** (and **`VITE_API_BASE`**) at build time—CI sets both so the static app matches production Pages.

## What runs in CI

- **Workflow**: `.github/workflows/deploy-pages.yml` on **push to `main`**.
- **Build**: Node **20**, `npm ci`, `npm run build` with:

  - `VITE_API_BASE=https://statsapi.mlb.com/api/v1` — browser calls MLB directly (no Express proxy on Pages).
  - `VITE_PUBLIC_PATH=/${{ github.event.repository.name }}/` — **project Pages base** (leading slash, trailing slash).

- **Deploy**: `upload-pages-artifact` from `dist`, then `deploy-pages` on environment **`github-pages`**.

## Repo settings (once)

- **Settings → Pages → Build and deployment**: source **GitHub Actions** (not “Deploy from a branch”).
- **Renaming the repo**: path updates automatically on the next deploy (`repository.name` in the workflow).

## Pre-release (local)

1. Run **`npm run lint`** and **`npm run test:run`** when behavior changed.
2. Build like CI (replace `REPO` with the GitHub repository name, e.g. `baseball-collection`):

```bash
VITE_PUBLIC_PATH=/REPO/ VITE_API_BASE=https://statsapi.mlb.com/api/v1 npm run build
npm run preview
```

3. Confirm assets load (no wrong-origin chunks), teams/rosters/people requests hit **statsapi.mlb.com**, and images work. Wrong **`VITE_PUBLIC_PATH`** usually shows missing JS/CSS or failed chunk loads.

## Release

1. Push (or merge) to **`main`**.
2. In **Actions**, open **Deploy to GitHub Pages**; fix **build** job failures first.
3. Use the run’s **deploy** / environment URL when the job finishes.

## Scope notes

- **`server.js`** is not part of GitHub Pages; it supports local dev and optional Node hosting (see `README.md` / Heroku).
- Do **not** commit secrets for this Pages flow; MLB endpoints used are public. Keep `.env*` local as usual.

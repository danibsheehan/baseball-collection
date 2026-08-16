---
name: pr-ready
description: >
  Runs baseball-collection local CI-parity checks and prepares a pull request
  (format check, lint, Vitest coverage thresholds, build, Pages env when
  needed). Use when the user asks to open a PR, prepare a pull request,
  pre-PR checks, make CI pass, or verify before merging.
---

# PR ready (baseball-collection)

Run before opening or updating a PR. Prefer full gates over “tests only.”

## Checklist

```
Pre-PR:
- [ ] Scope: only intended files; no secrets (.env, credentials)
- [ ] npm run format:check
- [ ] npm run lint
- [ ] npm run test:coverage
- [ ] npm run build
- [ ] Pages-shaped build if deploy/base/API env changed
- [ ] PR summary ready (Summary + Test plan)
```

### 1. Local CI parity

From the repo root:

```bash
npm run format:check
npm run lint
npm run test:coverage
npm run build
```

| Check           | Why                                                                                                         |
| --------------- | ----------------------------------------------------------------------------------------------------------- |
| `format:check`  | Prettier — same gate as **`.github/workflows/pull-request-tests.yml`**; run `npm run format` to fix         |
| `lint`          | ESLint on `src` (`.vue`, `.ts`) — same gate as **`.github/workflows/pull-request-tests.yml`**               |
| `test:coverage` | Matches CI; enforces Vitest thresholds in `vite.config.mjs`                                                 |
| `build`         | Matches CI (Pages-shaped `VITE_*` in the workflow); catches Vite/bundle breaks before Pages or Node hosting |

Faster while iterating (not a substitute before PR): `npm run test:run`.

If the change touches **`VITE_PUBLIC_PATH`**, **`VITE_API_BASE`**, Pages workflow, or subpath asset loading, also follow **`.cursor/skills/github-pages-deploy/SKILL.md`** (CI-shaped `build` + spot-check `preview`).

Proxy / validation work: confirm tests under `lib/**/*.test.mjs` still pass via coverage run; see **`api-proxy-hardening`**.

### 2. PR description

Use the repo PR template (`.github/pull_request_template.md`):

- **Summary** — what changed and why (1–3 bullets)
- **How to verify** — commands run (`lint` / `test:coverage` / `build`) and UI paths to exercise (team picker, roster deal, card flip), or `N/A` for tooling-only

Do not push or create the PR unless the user asked.

### 3. After merge (local cleanup)

When the PR is merged and the user is done with the branch (or asks to clean up):

```bash
git checkout main && git pull origin main
git branch -d <feature-branch>
```

Optionally `git fetch --prune` for stale remote-tracking refs.

## Anti-patterns

- Opening a PR after only `test:run` when coverage thresholds matter.
- Skipping `build` after Vite, dependency, or asset changes.
- Committing `.env*` or tokens.
- Amending or force-pushing unless the user explicitly requests it.
- Leaving merged feature branches checked out after the user asks to clean up.

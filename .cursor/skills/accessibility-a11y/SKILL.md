---
name: accessibility-a11y
description: >
  Accessibility for this Vue app: keyboard use, focus, ARIA, screen-reader
  announcements, reduced motion, and semantic structure. Use when improving a11y,
  auditing new UI, fixing focus traps, aria-labels, live regions, color/contrast,
  or motion; or when changing BaseballCard, team picker, album deal, or Lottie.
---

# Accessibility (a11y) — baseball-collection

## Patterns already in the codebase (extend, do not regress)

- **Live region** — `App.vue`: visually hidden `aria-live="polite"` + `aria-atomic="true"` for dynamic status text (`liveRegionText`).
- **Errors** — `role="alert"` on the teams error banner.
- **Loading** — `role="status"` for teams/roster loading copy.
- **Navigation** — `nav` with `aria-label="Major League Baseball teams"`; team rows use **`aria-current`** when selected (`Team.vue`).
- **Sections** — Picker groups use `role="group"` / `aria-labelledby` where a section label exists; player cards region **`aria-label="Player cards"`**, **`tabindex="-1"`** for programmatic focus after team/roster actions (`focusResultsSection` in `App.vue`).
- **Flippable cards** — `BaseballCard.vue`: inner control is **`role="button"`**, **`tabindex="0"`**, **`aria-pressed`**, **`aria-label`** from `flipAriaLabel`, **`@keydown`** for Space/Enter (pattern for custom interactive widgets).
- **Decorative chrome** — `aria-hidden="true"` on logos, folio numbers, ornaments, foil layers where appropriate (`Team.vue`, `PlayerLogo.vue`, `CardFoilGl.vue`, `CardBack.vue`, etc.).
- **Meaningful images** — `PlayerImage.vue` uses **`headshotAlt`**; keep alt text descriptive or empty only when truly decorative (document the choice).
- **Regions** — `PlayerInfo.vue`: `role="group"` / `role="region"` with **`aria-label`** for vitals; decorative watermark **`aria-hidden`**.
- **Pack animation** — `AlbumPackLottie.vue`: **`role="img"`** + **`aria-label`**; respects **`prefers-reduced-motion: reduce`** (skip heavy animation / Lottie when reduced—see README “Motion, accessibility, and animation cost”).
- **Motion elsewhere** — `prefers-reduced-motion` checks in `App.vue`, `CardFoilGl.vue`, `useCardTilt.js`, `useBinderPennantParallax.js`; CSS `@media (prefers-reduced-motion: reduce)` blocks across `App.vue`, `BaseballCard.vue`, `Team.vue`. **New motion** must follow the same pattern (instant or low-cost path, avoid loading Lottie JSON when reduced).
- **Focus rings** — `:focus-visible` with **`var(--color-focus-ring)`** on teams, search input, card container, album results (`App.vue`, `Team.vue`, `BaseballCard.vue`). Prefer **`:focus-visible`** over bare `:focus` for mouse users unless there is a deliberate exception.

## `index.html` baseline

- **`lang="en"`** on `<html>` — keep when localizing.
- **`noscript`** message — update if the app title or branding string changes.

## Checklist when adding or changing UI

1. **Keyboard** — Full path without a mouse; **Tab** order logical; **Space/Enter** on custom controls; no stuck **focus** on hidden/disabled content.
2. **Names** — Every interactive control has a **visible label** or **`aria-label` / `aria-labelledby`**; form-like inputs are associated with labels where applicable.
3. **State** — Busy/loading (`aria-busy` where used), expanded/collapsed, pressed (e.g. flip) exposed to assistive tech.
4. **Motion** — Honor **`prefers-reduced-motion`**; do not rely on motion alone to convey essential information.
5. **Color** — Do not rely on color alone for status; check **contrast** for text and focus rings on team-themed surfaces.
6. **Headings** — Preserve a sensible **heading** hierarchy if you introduce new sections (screen reader navigation).

## Verification (manual)

- **Keyboard-only** pass on the changed flow (including roster deal and card flip).
- **VoiceOver** (macOS) or **NVDA** (Windows) spot-check on the changed region.
- Optional: **axe DevTools** or **Lighthouse** accessibility audit on `npm run preview` (use **GitHub Pages–shaped** `VITE_PUBLIC_PATH` if testing subpath behavior).

When in doubt, match **`App.vue`**, **`BaseballCard.vue`**, and **`Team.vue`** before inventing new patterns.

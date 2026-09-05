import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const themesPath = path.join(root, 'src', 'styles', 'team-themes.css');
const tokensPath = path.join(root, 'src', 'styles', 'tokens.css');

const themesCss = fs.readFileSync(themesPath, 'utf8');
const tokensCss = fs.readFileSync(tokensPath, 'utf8');

const CAPTION_TEXT_MIN = 4.5; // WCAG 2.2 AA, normal/small text
const UI_COMPONENT_MIN = 3.0; // WCAG 1.4.11, non-text component contrast

function hexToRgb(hex) {
  const clean = hex.trim().replace('#', '');
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean;
  const num = parseInt(full, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

function relativeLuminance({ r, g, b }) {
  const channel = (v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrastRatio(hexA, hexB) {
  const lumA = relativeLuminance(hexToRgb(hexA));
  const lumB = relativeLuminance(hexToRgb(hexB));
  const lighter = Math.max(lumA, lumB);
  const darker = Math.min(lumA, lumB);
  return (lighter + 0.05) / (darker + 0.05);
}

function extractVar(block, name) {
  const match = block.match(new RegExp(`${name}:\\s*(#[0-9a-fA-F]{3,6})`));
  return match ? match[1] : null;
}

function extractRaw(block, name) {
  const match = block.match(new RegExp(`${name}:\\s*([^;]+);`));
  return match ? match[1].trim() : null;
}

function findBlock(css, selectorRegex) {
  const match = css.match(selectorRegex);
  if (!match) {
    return null;
  }
  const start = match.index + match[0].length;
  const end = css.indexOf('}', start);
  return css.slice(start, end);
}

/**
 * Resolves a token to an opaque hex color, following one level of `var(--x)` aliasing and
 * compositing translucent `rgba()` values over `backdropHex` (both border tokens here are
 * painted directly over the page surface).
 */
function resolveColor(block, name, backdropHex, depth = 0) {
  if (depth > 5) {
    return null;
  }
  const raw = extractRaw(block, name);
  if (!raw) {
    return null;
  }
  if (raw.startsWith('#')) {
    return raw;
  }
  const varMatch = raw.match(/^var\((--[\w-]+)/);
  if (varMatch) {
    return resolveColor(block, varMatch[1], backdropHex, depth + 1);
  }
  const rgbaMatch = raw.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)/);
  if (rgbaMatch) {
    const [, r, g, b, a] = rgbaMatch;
    const alpha = a === undefined ? 1 : parseFloat(a);
    if (alpha >= 1) {
      return { r: Number(r), g: Number(g), b: Number(b) };
    }
    const backdrop = hexToRgb(backdropHex);
    return {
      r: Number(r) * alpha + backdrop.r * (1 - alpha),
      g: Number(g) * alpha + backdrop.g * (1 - alpha),
      b: Number(b) * alpha + backdrop.b * (1 - alpha),
    };
  }
  return null;
}

function toRgb(colorOrHex) {
  return typeof colorOrHex === 'string' ? hexToRgb(colorOrHex) : colorOrHex;
}

function contrastRatioAny(colorA, colorB) {
  const lumA = relativeLuminance(toRgb(colorA));
  const lumB = relativeLuminance(toRgb(colorB));
  const lighter = Math.max(lumA, lumB);
  const darker = Math.min(lumA, lumB);
  return (lighter + 0.05) / (darker + 0.05);
}

// --- Per-team 1959 caption text vs field ---

const teamBlockRegex = /\[data-theme='([a-z]+)'\]\s*\{/g;
const teamResults = [];
let match;
while ((match = teamBlockRegex.exec(themesCss))) {
  const team = match[1];
  const start = match.index + match[0].length;
  const end = themesCss.indexOf('}', start);
  const block = themesCss.slice(start, end);

  const field = extractVar(block, '--theme-1959-field');
  const captionA = extractVar(block, '--theme-1959-caption-a');
  const captionB = extractVar(block, '--theme-1959-caption-b');

  if (!field || !captionA || !captionB) {
    teamResults.push({ team, error: 'missing token(s)' });
    continue;
  }

  const ratioA = contrastRatio(captionA, field);
  const ratioB = contrastRatio(captionB, field);
  teamResults.push({
    team,
    ratioA,
    ratioB,
    passA: ratioA >= CAPTION_TEXT_MIN,
    passB: ratioB >= CAPTION_TEXT_MIN,
  });
}

// --- Global team-button component boundary vs surface (light + dark) ---
// WCAG 1.4.11 asks whether the component's boundary is distinguishable from the page — either
// the fill or the always-visible 2px border (Team.vue) can carry that, and which one does
// varies by mode (see tokens.css), so a component passes if either ratio clears the bar.

const lightRoot = findBlock(tokensCss, /:root\s*\{/);
const darkRoot = findBlock(tokensCss, /@media \(prefers-color-scheme: dark\)\s*\{\s*:root\s*\{/);

function teamButtonBoundaryContrast(rootBlock, label) {
  const surface = extractVar(rootBlock, '--color-surface');
  if (!surface) {
    return { label, error: 'missing --color-surface' };
  }
  const fill = resolveColor(rootBlock, '--color-team-button', surface);
  const border = resolveColor(rootBlock, '--color-team-button-border', surface);
  if (!fill || !border) {
    return { label, error: 'missing --color-team-button / --color-team-button-border' };
  }
  const fillRatio = contrastRatioAny(fill, surface);
  const borderRatio = contrastRatioAny(border, surface);
  const ratio = Math.max(fillRatio, borderRatio);
  return { label, fillRatio, borderRatio, ratio, pass: ratio >= UI_COMPONENT_MIN };
}

const buttonResults = [
  teamButtonBoundaryContrast(lightRoot, 'light'),
  teamButtonBoundaryContrast(darkRoot, 'dark'),
];

// --- Report ---

console.log('\n── 1959 caption text vs field (AA small text, need ≥4.5:1) ──\n');
console.log('team\tcaption-a\tcaption-b');
let anyFail = false;
for (const r of teamResults) {
  if (r.error) {
    anyFail = true;
    console.log(`${r.team}\tERROR: ${r.error}`);
    continue;
  }
  const flagA = r.passA ? '' : '  FAIL';
  const flagB = r.passB ? '' : '  FAIL';
  if (!r.passA || !r.passB) {
    anyFail = true;
  }
  console.log(`${r.team}\t${r.ratioA.toFixed(2)}${flagA}\t\t${r.ratioB.toFixed(2)}${flagB}`);
}

console.log(
  '\n── team-button component boundary vs surface (WCAG 1.4.11, best of fill/border ≥3:1) ──\n',
);
console.log('mode\tfill\tborder\tbest');
for (const r of buttonResults) {
  if (r.error) {
    anyFail = true;
    console.log(`${r.label}\tERROR: ${r.error}`);
    continue;
  }
  const flag = r.pass ? '' : '  FAIL';
  if (!r.pass) {
    anyFail = true;
  }
  console.log(
    `${r.label}\t${r.fillRatio.toFixed(2)}\t${r.borderRatio.toFixed(2)}\t${r.ratio.toFixed(2)}${flag}`,
  );
}

console.log('');

if (anyFail) {
  console.error('contrast-report: one or more pairs fall below their WCAG threshold.\n');
  process.exit(1);
} else {
  console.log('contrast-report: all checked pairs meet their WCAG threshold.\n');
}

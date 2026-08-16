/** Query key for shareable club deep links (`?team=nyy`). */
export const TEAM_QUERY_PARAM = 'team';

export type HistoryWriteMode = 'push' | 'replace';

export type TeamWithCode = {
  teamCode?: string | null;
} & Record<string, unknown>;

/** Normalize MLB teamCode for URL + matching (trim, lower-case). */
export function normalizeTeamCode(code: string | null | undefined): string {
  return String(code ?? '')
    .trim()
    .toLowerCase();
}

/** Read `team` from a query string (`?team=bos` or `team=bos`). */
export function readTeamCodeFromSearch(search: string): string | null {
  const raw = search.startsWith('?') ? search.slice(1) : search;
  const params = new URLSearchParams(raw);
  const normalized = normalizeTeamCode(params.get(TEAM_QUERY_PARAM));
  return normalized || null;
}

export function readTeamCodeFromLocation(
  loc: Pick<Location, 'search'> = typeof location !== 'undefined' ? location : { search: '' },
): string | null {
  return readTeamCodeFromSearch(loc.search || '');
}

/** Set or remove `team` on a URL copy (mutates a clone conceptually via new URL). */
export function applyTeamCodeToUrl(url: URL, teamCode: string | null | undefined): URL {
  const next = new URL(url.href);
  const code = normalizeTeamCode(teamCode);
  if (code) {
    next.searchParams.set(TEAM_QUERY_PARAM, code);
  } else {
    next.searchParams.delete(TEAM_QUERY_PARAM);
  }
  return next;
}

function pathSearchHash(url: URL): string {
  return `${url.pathname}${url.search}${url.hash}`;
}

/**
 * Sync `?team=` with History. No-ops when the resolved href is unchanged
 * (avoids cluttering the stack on hydrate / re-select).
 */
export function writeTeamCodeToHistory(
  teamCode: string | null | undefined,
  mode: HistoryWriteMode,
  historyApi: Pick<History, 'pushState' | 'replaceState' | 'state'> = history,
  loc: Pick<Location, 'href'> = location,
): void {
  const current = new URL(loc.href);
  const next = applyTeamCodeToUrl(current, teamCode);
  if (next.href === current.href) {
    return;
  }
  const relative = pathSearchHash(next);
  if (mode === 'push') {
    historyApi.pushState(historyApi.state, '', relative);
  } else {
    historyApi.replaceState(historyApi.state, '', relative);
  }
}

/** Find a club whose normalized teamCode matches (e.g. `NYY` ↔ `nyy`). */
export function findTeamByTeamCode<T extends TeamWithCode>(
  teams: T[] | null | undefined,
  code: string | null | undefined,
): T | undefined {
  const normalized = normalizeTeamCode(code);
  if (!normalized) {
    return undefined;
  }
  return (teams || []).find((t) => normalizeTeamCode(t.teamCode) === normalized);
}

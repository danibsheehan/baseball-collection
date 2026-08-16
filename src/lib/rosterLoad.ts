import {
  PEOPLE_BATCH_SIZE,
  chunkPersonIds,
  enrichRosterWithPlayerInfo,
  peopleByIdFromResponses,
  uniquePersonIds,
  type RosterRow,
} from './rosterPeople';

/** Minimal HTTP surface used by the MLB proxy client. */
export type RosterHttp = {
  /* eslint-disable no-unused-vars -- documents the axios-like get signature */
  get: (
    url: string,
    config?: { params?: Record<string, string> },
  ) => Promise<{ data?: { roster?: RosterRow[]; people?: unknown[] } }>;
  /* eslint-enable no-unused-vars */
};

export type FetchEnrichedRosterResult = {
  players: Array<RosterRow & { playerInfo: Record<string, unknown> }>;
  /** True when the roster response had no person ids to enrich. */
  empty: boolean;
};

function sortRosterByPlayerName<T extends RosterRow & { playerInfo?: { fullName?: string } }>(
  rows: T[],
): T[] {
  return [...rows].sort((a, b) => {
    const an = String(a.playerInfo?.fullName ?? a.person?.fullName ?? '');
    const bn = String(b.playerInfo?.fullName ?? b.person?.fullName ?? '');
    return an.localeCompare(bn, undefined, { sensitivity: 'base' });
  });
}

async function fetchPeopleByIds(http: RosterHttp, personIds: number[]) {
  const unique = uniquePersonIds(personIds);
  const chunks = chunkPersonIds(unique, PEOPLE_BATCH_SIZE);
  return Promise.all(
    chunks.map((chunk) => http.get('people', { params: { personIds: chunk.join(',') } })),
  )
    .then((responses) => peopleByIdFromResponses(responses))
    .catch(() => ({}) as Record<number, never>);
}

/**
 * Load a club roster and batch-enrich with `/people` (same path as the checklist chips).
 * Rejects when the roster request fails; people failures degrade to empty `playerInfo`.
 *
 * @param opts.onRosterLoaded — called after a non-empty roster arrives (before people batch)
 */
export async function fetchEnrichedRoster(
  http: RosterHttp,
  teamId: number | string,
  opts: { onRosterLoaded?: () => void } = {},
): Promise<FetchEnrichedRosterResult> {
  const response = await http.get(`teams/${teamId}/roster`);
  const data = response.data?.roster || [];
  const ids = data.map((r) => r.person?.id).filter(Boolean) as number[];
  if (!ids.length) {
    return { players: [], empty: true };
  }
  opts.onRosterLoaded?.();
  const byId = await fetchPeopleByIds(http, ids);
  const enriched = enrichRosterWithPlayerInfo(data, byId);
  return { players: sortRosterByPlayerName(enriched), empty: false };
}

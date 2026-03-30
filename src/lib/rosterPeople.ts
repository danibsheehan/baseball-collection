export const PEOPLE_BATCH_SIZE = 50;

export type PersonRecord = {
	id: number;
} & Record<string, unknown>;

export type PeopleBatchResponse = {
	data?: { people?: PersonRecord[] };
};

export type RosterRow = {
	person?: { id?: number };
} & Record<string, unknown>;

/** Unique person IDs in first-seen order (matches Set spread behavior). */
export function uniquePersonIds(personIds: unknown[]): number[] {
	return [...new Set(personIds.filter(Boolean))] as number[];
}

export function chunkPersonIds(ids: number[], batchSize: number): number[][] {
	const chunks: number[][] = [];
	for (let i = 0; i < ids.length; i += batchSize) {
		chunks.push(ids.slice(i, i + batchSize));
	}
	return chunks;
}

/** Merge MLB `people` arrays from batched GET responses into a map by id. */
export function peopleByIdFromResponses(
	responses: PeopleBatchResponse[]
): Record<number, PersonRecord> {
	const people = responses.flatMap((r) => r.data?.people ?? []);
	return Object.fromEntries(people.map((p) => [p.id, p]));
}

/** Attach `playerInfo` from `byId` to each roster row. */
export function enrichRosterWithPlayerInfo<T extends RosterRow>(
	roster: T[],
	byId: Record<number, PersonRecord | undefined>
): Array<T & { playerInfo: PersonRecord | Record<string, never> }> {
	return roster.map((r) => {
		const id = r.person?.id;
		const playerInfo =
			id !== undefined ? (byId[id] ?? {}) : ({} as Record<string, never>);
		return { ...r, playerInfo };
	});
}

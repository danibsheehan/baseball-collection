/** localStorage key for the client-only album (no backend). */
export const ALBUM_STORAGE_KEY = 'cartophiles.album.v1';

export type AlbumCollectedEntry = {
	personId: number;
	teamId?: number | null;
	collectedAt: string;
};

export type AlbumStore = {
	version: 1;
	collected: Record<string, AlbumCollectedEntry>;
};

export type ToggleCollectMeta = {
	teamId?: number | null;
	now?: Date;
};

export type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

export function createEmptyAlbumStore(): AlbumStore {
	return { version: 1, collected: {} };
}

function personKey(personId: number): string {
	return String(personId);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
	return value != null && typeof value === 'object' && !Array.isArray(value);
}

/** Coerce unknown JSON into a v1 album store (invalid shapes → empty). */
export function normalizeAlbumStore(raw: unknown): AlbumStore {
	if (!isPlainObject(raw) || raw.version !== 1 || !isPlainObject(raw.collected)) {
		return createEmptyAlbumStore();
	}
	const collected: Record<string, AlbumCollectedEntry> = {};
	for (const [key, entry] of Object.entries(raw.collected)) {
		if (!isPlainObject(entry)) {
			continue;
		}
		const personId = Number(entry.personId ?? key);
		if (!Number.isFinite(personId)) {
			continue;
		}
		collected[personKey(personId)] = {
			personId,
			teamId:
				entry.teamId == null || entry.teamId === ''
					? null
					: Number.isFinite(Number(entry.teamId))
						? Number(entry.teamId)
						: null,
			collectedAt:
				typeof entry.collectedAt === 'string' && entry.collectedAt
					? entry.collectedAt
					: new Date(0).toISOString()
		};
	}
	return { version: 1, collected };
}

export function readAlbumStore(storage: StorageLike | null | undefined): AlbumStore {
	if (!storage || typeof storage.getItem !== 'function') {
		return createEmptyAlbumStore();
	}
	try {
		const raw = storage.getItem(ALBUM_STORAGE_KEY);
		if (!raw) {
			return createEmptyAlbumStore();
		}
		return normalizeAlbumStore(JSON.parse(raw));
	} catch {
		return createEmptyAlbumStore();
	}
}

export function writeAlbumStore(
	store: AlbumStore,
	storage: StorageLike | null | undefined
): void {
	if (!storage || typeof storage.setItem !== 'function') {
		return;
	}
	const normalized = normalizeAlbumStore(store);
	storage.setItem(ALBUM_STORAGE_KEY, JSON.stringify(normalized));
}

export function isCollected(
	store: AlbumStore | null | undefined,
	personId: number | null | undefined
): boolean {
	if (personId == null || !Number.isFinite(personId) || !store?.collected) {
		return false;
	}
	return personKey(personId) in store.collected;
}

/**
 * Add or remove a person from the album.
 * Returns a new store object (immutable-friendly for Vue refs).
 */
export function toggleCollected(
	store: AlbumStore | null | undefined,
	personId: number,
	meta: ToggleCollectMeta = {}
): { store: AlbumStore; collected: boolean } {
	const base = normalizeAlbumStore(store ?? createEmptyAlbumStore());
	const key = personKey(personId);
	const nextCollected = { ...base.collected };

	if (key in nextCollected) {
		delete nextCollected[key];
		return {
			store: { version: 1, collected: nextCollected },
			collected: false
		};
	}

	const now = meta.now ?? new Date();
	nextCollected[key] = {
		personId,
		teamId: meta.teamId ?? null,
		collectedAt: now.toISOString()
	};
	return {
		store: { version: 1, collected: nextCollected },
		collected: true
	};
}

/** How many roster person IDs appear in the album. */
export function countCollectedOnRoster(
	store: AlbumStore | null | undefined,
	personIds: Array<number | null | undefined>
): number {
	let n = 0;
	const seen = new Set<number>();
	for (const id of personIds) {
		if (id == null || !Number.isFinite(id) || seen.has(id)) {
			continue;
		}
		seen.add(id);
		if (isCollected(store, id)) {
			n += 1;
		}
	}
	return n;
}

/** Count collected pasteboards tagged with each club id (from collect-time `teamId`). */
export function countCollectedByTeamId(
	store: AlbumStore | null | undefined
): Record<number, number> {
	const counts: Record<number, number> = {};
	for (const entry of Object.values(store?.collected ?? {})) {
		const teamId = entry?.teamId;
		if (teamId == null || !Number.isFinite(teamId)) {
			continue;
		}
		counts[teamId] = (counts[teamId] ?? 0) + 1;
	}
	return counts;
}

export function countCollectedForTeam(
	store: AlbumStore | null | undefined,
	teamId: number | null | undefined
): number {
	if (teamId == null || !Number.isFinite(teamId)) {
		return 0;
	}
	return countCollectedByTeamId(store)[teamId] ?? 0;
}

export type RosterAlbumFilter = 'all' | 'album';

export type RosterPlayerLike = {
	person?: { id?: number | null };
} & Record<string, unknown>;

/** Filter a loaded roster to collected cards only when `filter === 'album'`. */
export function filterRosterPlayersByAlbum<T extends RosterPlayerLike>(
	players: T[] | null | undefined,
	store: AlbumStore | null | undefined,
	filter: RosterAlbumFilter = 'all'
): T[] {
	const list = players ?? [];
	if (filter !== 'album') {
		return list;
	}
	return list.filter((row) => isCollected(store, row?.person?.id));
}

/** Completeness fill width for the roster pennant strip. */
export function rosterCompletenessFillPercent(owned: number, total: number): string {
	if (!(total > 0) || !(owned > 0)) {
		return '0%';
	}
	return `${Math.min(100, (owned / total) * 100)}%`;
}

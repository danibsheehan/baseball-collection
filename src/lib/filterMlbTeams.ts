export type TeamWithSport = {
	sport?: { name?: string };
} & Record<string, unknown>;

/** Keep teams whose sport is Major League Baseball (Stats API shape). */
export function filterMajorLeagueBaseballTeams(
	teams: TeamWithSport[] | null | undefined
): TeamWithSport[] {
	return (teams || []).filter(
		(t) => t.sport && t.sport.name === 'Major League Baseball'
	);
}

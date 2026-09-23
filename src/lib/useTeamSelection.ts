import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { filterMajorLeagueBaseballTeams, type TeamWithSport } from './filterMlbTeams';
import { fetchEnrichedRoster, type RosterHttp } from './rosterLoad';
import {
  buildTeamPickerSections,
  filterTeamPickerSections,
  type PickerTeam,
} from './teamPickerSections';
import {
  findTeamByTeamCode,
  readTeamCodeFromLocation,
  writeTeamCodeToHistory,
  type TeamWithCode,
} from './teamUrlState';

export type SelectableTeam = PickerTeam &
  TeamWithSport &
  TeamWithCode & {
    id: number;
  };

export type UseTeamSelectionArgs = {
  http: RosterHttp;
  /** Called synchronously whenever a team is selected or cleared (e.g. to reset an album filter). */
  onTeamChange?: () => void;
};

/**
 * Club list load + search, roster fetch on select, and `?team=` URL sync
 * (deep link hydrate, history push/replace, browser back/forward).
 */
export function useTeamSelection({ http, onTeamChange }: UseTeamSelectionArgs) {
  /** Bumps on each roster request so stale responses do not overwrite a newer club. */
  let rosterRequestId = 0;

  const players = ref<Array<Record<string, unknown>>>([]);
  const teamName = ref('');
  const selectedTeamId = ref<number | null>(null);
  const teams = ref<SelectableTeam[]>([]);
  const theme = ref('');
  const teamsLoading = ref(true);
  const teamsError = ref('');
  const liveRegionText = ref('');
  const rosterLoading = ref(false);
  /** 'idle' | 'pulling' | 'faces' — while a roster request is in flight */
  const rosterLoadStage = ref<'idle' | 'pulling' | 'faces'>('idle');
  const resultsSection = ref<HTMLElement | null>(null);
  const teamSearchQuery = ref('');

  const teamPickerSections = computed(() => buildTeamPickerSections(teams.value));

  const filteredTeamSections = computed(() =>
    filterTeamPickerSections(teamPickerSections.value, teamSearchQuery.value),
  );

  /** While loading or empty API, avoid flashing “no matches” before sections exist. */
  const displayTeamSections = computed(() => {
    if (teamsLoading.value || !teams.value.length) {
      return teamPickerSections.value;
    }
    return filteredTeamSections.value;
  });

  /** Program layout: side-by-side league columns on wide checklist rail when AL + NL. */
  const teamsSectionsLayoutClass = computed(() => {
    const n = displayTeamSections.value.length;
    if (n <= 1) {
      return 'teams__sections--solo';
    }
    if (n === 2) {
      return 'teams__sections--duo';
    }
    return 'teams__sections--multi';
  });

  const rosterLoadingHeadline = computed(() => {
    if (rosterLoadStage.value === 'faces') {
      return 'Mounting portraits…';
    }
    return 'Loading the roster…';
  });

  function setLiveMessage(message: string) {
    liveRegionText.value = message;
  }

  function focusResultsSection() {
    nextTick(() => {
      const el = resultsSection.value;
      if (!el || typeof el.focus !== 'function') {
        return;
      }
      el.focus({ preventScroll: true });
      if (typeof el.scrollIntoView === 'function') {
        try {
          el.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'instant' });
        } catch {
          el.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'auto' });
        }
      }
    });
  }

  watch(selectedTeamId, (id) => {
    if (id != null) {
      focusResultsSection();
    }
  });

  watch(rosterLoading, (loading, wasLoading) => {
    if (!loading && wasLoading && selectedTeamId.value != null) {
      focusResultsSection();
    }
  });

  function setRosterLoadStage(stage: 'idle' | 'pulling' | 'faces') {
    rosterLoadStage.value = stage;
  }

  function setRosterLoading(loading: boolean) {
    rosterLoading.value = loading;
    if (!loading) {
      rosterLoadStage.value = 'idle';
    }
  }

  function applySelectedTeam(team: SelectableTeam) {
    selectedTeamId.value = team.id;
    theme.value = team.teamCode?.toLowerCase() || '';
    teamName.value = team.name || '';
    onTeamChange?.();
  }

  function clearSelectedTeam() {
    selectedTeamId.value = null;
    theme.value = '';
    teamName.value = '';
    players.value = [];
    onTeamChange?.();
  }

  /**
   * Load a club roster (checklist click, URL hydrate, or browser history).
   */
  async function selectTeam(
    team: SelectableTeam,
    opts: { historyMode?: 'push' | 'replace' | 'none' } = {},
  ) {
    const historyMode = opts.historyMode ?? 'push';
    const requestId = ++rosterRequestId;

    applySelectedTeam(team);
    if (historyMode !== 'none') {
      writeTeamCodeToHistory(team.teamCode?.toLowerCase() || null, historyMode);
    }

    players.value = [];
    setLiveMessage(`Loading cards for ${team.name}.`);
    setRosterLoadStage('pulling');
    setRosterLoading(true);

    try {
      const { players: nextPlayers, empty } = await fetchEnrichedRoster(http, team.id, {
        onRosterLoaded: () => {
          if (requestId === rosterRequestId) {
            setRosterLoadStage('faces');
          }
        },
      });
      if (requestId !== rosterRequestId) {
        return;
      }
      players.value = nextPlayers;
      if (empty) {
        setLiveMessage(`No cards listed for ${team.name}.`);
      } else {
        setLiveMessage(
          `Showing ${nextPlayers.length} ${nextPlayers.length === 1 ? 'card' : 'cards'} for ${team.name}.`,
        );
      }
    } catch {
      if (requestId !== rosterRequestId) {
        return;
      }
      players.value = [];
      setLiveMessage(`Could not load cards for ${team.name}.`);
    } finally {
      if (requestId === rosterRequestId) {
        setRosterLoading(false);
      }
    }
  }

  function onTeamSelect(team: SelectableTeam) {
    if (team?.id == null) {
      return;
    }
    const historyMode = selectedTeamId.value === team.id ? 'replace' : 'push';
    selectTeam(team, { historyMode });
  }

  /**
   * Apply `?team=` from the location (boot hydrate or popstate).
   */
  function syncTeamFromLocation(opts: { announceMissing?: boolean } = {}) {
    const announceMissing = opts.announceMissing !== false;
    const code = readTeamCodeFromLocation();

    if (!code) {
      if (selectedTeamId.value != null) {
        rosterRequestId += 1;
        clearSelectedTeam();
        setRosterLoading(false);
        setLiveMessage('Club cleared. Pick a club to see the cards.');
      }
      return;
    }

    const team = findTeamByTeamCode(teams.value, code) as SelectableTeam | undefined;
    if (!team) {
      if (announceMissing) {
        setLiveMessage(`No club on file for “${code}”.`);
      }
      writeTeamCodeToHistory(null, 'replace');
      return;
    }

    if (selectedTeamId.value === team.id && (players.value.length > 0 || rosterLoading.value)) {
      return;
    }

    selectTeam(team, { historyMode: 'none' });
  }

  function onTeamPopState() {
    syncTeamFromLocation();
  }

  onMounted(() => {
    window.addEventListener('popstate', onTeamPopState);
    teams.value = [];
    teamsLoading.value = true;
    teamsError.value = '';
    liveRegionText.value = 'Loading clubs.';
    http
      .get('teams')
      .then((response) => {
        const teamsData = (response.data as { teams?: TeamWithSport[] } | undefined)?.teams;
        const data = filterMajorLeagueBaseballTeams(teamsData || []).sort((a, b) =>
          String(a.name || '').localeCompare(String(b.name || ''), undefined, {
            sensitivity: 'base',
          }),
        ) as SelectableTeam[];
        teams.value = data;
        teamsError.value = '';
        const deepLinkCode = readTeamCodeFromLocation();
        const deepLinkTeam = deepLinkCode ? findTeamByTeamCode(data, deepLinkCode) : undefined;
        if (deepLinkTeam) {
          liveRegionText.value = `Loading cards for ${deepLinkTeam.name}.`;
        } else if (deepLinkCode) {
          liveRegionText.value = `No club on file for “${deepLinkCode}”.`;
        } else {
          liveRegionText.value =
            data.length > 0
              ? `${data.length} clubs on file. Pick a club to see the cards.`
              : 'No teams available.';
        }
      })
      .catch((err) => {
        console.error('teams request failed', err);
        teams.value = [];
        teamsError.value =
          'Could not load teams. Check your connection or try refreshing the page.';
      })
      .finally(() => {
        teamsLoading.value = false;
        nextTick(() => {
          syncTeamFromLocation({ announceMissing: false });
        });
      });
  });

  onUnmounted(() => {
    window.removeEventListener('popstate', onTeamPopState);
  });

  return {
    teams,
    teamName,
    selectedTeamId,
    theme,
    teamsLoading,
    teamsError,
    teamSearchQuery,
    players,
    rosterLoading,
    rosterLoadingHeadline,
    liveRegionText,
    resultsSection,
    filteredTeamSections,
    displayTeamSections,
    teamsSectionsLayoutClass,
    onTeamSelect,
    setLiveMessage,
  };
}

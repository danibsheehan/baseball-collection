<template>
	<div id="app">
		<p class="visually-hidden" aria-live="polite" aria-atomic="true">{{ liveRegionText }}</p>
		<div v-if="teamsError" class="app__banner app__banner--error" role="alert">
			{{ teamsError }}
		</div>
		<header class="app__title">
			<img src="./assets/baseball.png" alt="" class="title__img" width="100" height="100">
			<div class="app__title-text">
				<h1 class="album__search--title">Pick a team</h1>
				<p class="app__title-subtitle">
					Get your cards for every MLB team.
				</p>
			</div>
			<img src="./assets/baseball.png" alt="" class="title__img" width="100" height="100">
		</header>
		<main class="app__main">
			<div class="album__search">
				<p v-if="teamsLoading" class="album__status">Loading teams…</p>
				<nav class="teams__nav" aria-label="Major League Baseball teams">
					<div class="teams__container">
						<Team
							v-for="team in teams"
							:key="team.id"
							:team="team"
							:selected="selectedTeamId === team.id"
							@updatePlayers="loadPlayers"
							@updateTeam="loadTeam"
							@liveMessage="setLiveMessage"
							@rosterLoading="setRosterLoading"
						/>
					</div>
				</nav>
			</div>
			<section
				ref="resultsSection"
				class="album__results"
				:class="{ 'album__results--many-cards': players.length > 30 }"
				aria-label="Player cards"
				tabindex="-1"
				:aria-busy="rosterLoading ? true : undefined"
			>
				<p v-if="rosterLoading" class="album__results-status">
					<span class="album__spinner" aria-hidden="true"></span>
					Loading roster…
				</p>
				<p
					v-else-if="selectedTeamId === null"
					class="album__results-placeholder"
				>
					Choose a team above.
				</p>
				<template v-else>
					<h2
						v-if="players.length"
						class="album__results--title"
						:data-theme="theme || undefined"
					>Your Baseball Cards for the {{ teamName }}!</h2>
					<BaseballCard
						v-for="player in players"
						:key="player.person.id"
						:player="player"
						:theme="theme"
						:teamName="teamName"
						:manyPlayers="players.length > 30"
					/>
					<p
						v-if="!players.length"
						class="album__results-empty"
					>
						No players to show for the {{ teamName }}.
					</p>
				</template>
			</section>
		</main>
	</div>
</template>

<script setup>
import { ref, watch, nextTick, onMounted } from 'vue';
import BaseballCard from './components/BaseballCard.vue';
import Team from './components/Team.vue';
import http from './http-common';
import { filterMajorLeagueBaseballTeams } from './lib/filterMlbTeams';

const players = ref([]);
const teamName = ref('');
const selectedTeamId = ref(null);
const teams = ref([]);
const theme = ref('');
const teamsLoading = ref(true);
const teamsError = ref('');
const liveRegionText = ref('');
const rosterLoading = ref(false);
const resultsSection = ref(null);

function focusResultsSection() {
	nextTick(() => {
		const el = resultsSection.value;
		if (!el || typeof el.focus !== 'function') {
			return;
		}
		el.focus({ preventScroll: true });
		el.scrollIntoView({ block: 'start', behavior: 'auto' });
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

function loadPlayers(nextPlayers) {
	players.value = nextPlayers;
}

function loadTeam(team) {
	selectedTeamId.value = team.id;
	theme.value = team.teamCode?.toLowerCase() || '';
	teamName.value = team.name;
}

function setLiveMessage(message) {
	liveRegionText.value = message;
}

function setRosterLoading(loading) {
	rosterLoading.value = loading;
}

onMounted(() => {
	teams.value = [];
	teamsLoading.value = true;
	teamsError.value = '';
	liveRegionText.value = 'Loading team list.';
	http.get('teams')
		.then((response) => {
			const data = filterMajorLeagueBaseballTeams(response.data.teams || []).sort(
				(a, b) => String(a.name || '').localeCompare(String(b.name || ''), undefined, { sensitivity: 'base' })
			);
			teams.value = data;
			teamsError.value = '';
			liveRegionText.value =
				data.length > 0
					? `${data.length} teams loaded. Choose a team to see cards.`
					: 'No teams available.';
		})
		.catch((err) => {
			console.error('teams request failed', err);
			teams.value = [];
			teamsError.value =
				'Could not load teams. Check your connection or try refreshing the page.';
		})
		.finally(() => {
			teamsLoading.value = false;
		});
});
</script>

<style>
/*
 * Typography / brand: see src/styles/tokens.css (--font-ui, --font-card).
 * Mukta — app shell; Montserrat — card surfaces only.
 */
html {
	box-sizing: border-box;
}

*,
*::before,
*::after {
	box-sizing: inherit;
}

body {
	margin: 0;
	min-height: 100vh;
	background: var(--color-surface);
	color: var(--color-text);
}
</style>

<style scoped>
#app {
	font-family: var(--font-ui);
	margin: 0 auto;
	max-width: 1280px;
	padding-bottom: calc(clamp(3rem, 10vw, 5rem) + env(safe-area-inset-bottom, 0px));
	padding-left: calc(clamp(1rem, 5vw, 2.25rem) + env(safe-area-inset-left, 0px));
	padding-right: calc(clamp(1rem, 5vw, 2.25rem) + env(safe-area-inset-right, 0px));
	padding-top: calc(clamp(1.25rem, 4vw, 2rem) + env(safe-area-inset-top, 0px));
}

.visually-hidden {
	border: 0;
	clip: rect(0, 0, 0, 0);
	height: 1px;
	margin: -1px;
	overflow: hidden;
	padding: 0;
	position: absolute;
	white-space: nowrap;
	width: 1px;
}

.app__banner {
	border-radius: var(--radius-sm);
	margin: 0 auto var(--space-5);
	max-width: 800px;
	padding: var(--space-4) var(--space-5);
	text-align: center;
	width: 90%;
}

.app__banner--error {
	background: var(--color-danger-bg);
	border: 1px solid var(--color-danger-border);
	color: var(--color-danger-text);
}

.app__main {
	margin: 0 auto;
	max-width: 1200px;
	padding-bottom: clamp(1.5rem, 4vw, 2.5rem);
}

.album__status {
	margin: 0 auto var(--space-4);
	max-width: 800px;
	text-align: center;
	width: 70%;
}

.album__results-status {
	align-items: center;
	color: var(--color-text-muted);
	display: flex;
	gap: var(--space-3);
	grid-column: 1 / -1;
	justify-content: center;
	justify-self: stretch;
	margin: 0;
	text-align: center;
	width: 100%;
}

.album__results-placeholder,
.album__results-empty {
	color: var(--color-text-muted);
	grid-column: 1 / -1;
	justify-self: stretch;
	margin: 0;
	text-align: center;
	width: 100%;
}

.album__spinner {
	animation: album-spin 0.7s linear infinite;
	border: 2px solid var(--color-border-medium);
	border-radius: 50%;
	border-top-color: var(--color-accent);
	box-sizing: border-box;
	display: inline-block;
	flex-shrink: 0;
	height: 1.125rem;
	width: 1.125rem;
}

@media (prefers-reduced-motion: reduce) {
	.album__spinner {
		animation: none;
	}
}

@keyframes album-spin {
	to {
		transform: rotate(360deg);
	}
}

.teams__nav {
	background: var(--color-surface-nav);
	backdrop-filter: blur(10px);
	-webkit-backdrop-filter: blur(10px);
	border-bottom: 1px solid var(--color-border-subtle);
	padding-block: var(--space-3) var(--space-4);
	position: sticky;
	top: env(safe-area-inset-top, 0px);
	width: 100%;
	z-index: 10;
}

h1,
h2 {
	text-align: center;
}

.app__title {
	align-items: center;
	display: flex;
	flex-wrap: wrap;
	gap: 0.75rem 1.25rem;
	justify-content: center;
	margin: 0 auto clamp(1.25rem, 4vw, 2rem);
	max-width: 1100px;
	width: 100%;
}

.app__title-text {
	flex: 1 1 100%;
	text-align: center;
}

.app__title-subtitle {
	color: var(--color-text-muted);
	font-size: clamp(1rem, 2.4vw, 1.2rem);
	font-weight: 500;
	line-height: 1.45;
	margin: 0.35rem auto 0;
	max-width: 28em;
}

.title__img {
	display: block;
	flex-shrink: 0;
	height: auto;
	width: clamp(64px, 18vw, 100px);
}

.album__search {
	margin: 0 auto;
	max-width: 800px;
}

.album__search--title {
	font-size: clamp(1.75rem, 4.5vw, 2.625rem);
	font-weight: 700;
	line-height: 1.15;
	margin: 0;
}

.teams__container {
	align-items: stretch;
	display: grid;
	gap: var(--space-2);
	grid-template-columns: repeat(3, minmax(0, 1fr));
	width: 100%;
}

@media (min-width: 1280px) {
	.teams__container {
		grid-template-columns: repeat(4, minmax(0, 1fr));
	}
}

@media (max-width: 480px) {
	.teams__container {
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}
}

@media (max-width: 340px) {
	.teams__container {
		grid-template-columns: minmax(0, 1fr);
	}
}

.album__results {
	display: grid;
	gap: clamp(1rem, 3vw, 1.5rem);
	grid-template-columns: repeat(auto-fill, minmax(min(250px, 100%), 1fr));
	justify-items: center;
	margin: clamp(2rem, 6vw, 3rem) auto 0;
	max-width: 1200px;
	/* Clear sticky team nav when scrolling into view or focusing */
	scroll-margin-top: calc(0.75rem + 48px + env(safe-area-inset-top, 0px));
}

.album__results--many-cards {
	--shadow-card: var(--shadow-card-large-roster);
}

.album__results:focus {
	outline: none;
}

.album__results:focus-visible {
	box-shadow:
		0 0 0 3px var(--color-focus-ring),
		0 0 0 5px var(--color-accent);
	outline: 2px solid transparent;
}

.album__results--title {
	color: var(--theme-heading, var(--color-text));
	font-size: clamp(1.25rem, 4vw, 2rem);
	font-weight: 700;
	grid-column: 1 / -1;
	justify-self: stretch;
	line-height: 1.2;
	text-align: center;
	width: 100%;
}

@media (prefers-color-scheme: dark) {
	.album__results--title {
		color: var(--color-text);
	}

	@supports (color: color-mix(in srgb, red 10%, blue 90%)) {
		.album__results--title {
			color: color-mix(
				in srgb,
				var(--theme-heading, var(--color-text)) 45%,
				var(--color-text) 55%
			);
		}
	}
}

/* Narrow: baseballs on one row, title block full width below */
@media (max-width: 600px) {
	.app__title-text {
		order: 3;
	}

	.app__title .title__img:first-of-type {
		order: 1;
	}

	.app__title .title__img:last-of-type {
		order: 2;
	}
}

/* Wide: flanking images + centered title */
@media (min-width: 601px) {
	.app__title {
		flex-wrap: nowrap;
		justify-content: space-evenly;
	}

	.app__title-text {
		flex: 0 1 auto;
		padding-inline: 0.25rem;
	}
}

</style>

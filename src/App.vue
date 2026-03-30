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
				class="album__results"
				aria-label="Player cards"
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
						class="album__results--title"
						v-if="players.length"
						:data-theme="theme || undefined"
					>Your Baseball Cards for the {{ teamName }}!</h2>
					<BaseballCard
						v-for="player in players"
						:key="player.person.id"
						:player="player"
						:theme="theme"
						:teamName="teamName"
					/>
				</template>
			</section>
		</main>
	</div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
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
 * Typography / brand (fonts loaded in index.html)
 * Mukta    — app shell: layout, team nav, headings, status copy (UI)
 * Montserrat — baseball cards only: front/back surfaces (“product” typography)
 */
:root {
	--font-ui: 'Mukta', sans-serif;
	--font-card: 'Montserrat', sans-serif;
}

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
	background: #f0efeb;
	color: #1a1a1a;
}
</style>

<style scoped>
#app {
	font-family: var(--font-ui);
	margin: 0 auto;
	max-width: 1280px;
	padding: clamp(1.25rem, 4vw, 2rem) clamp(1rem, 5vw, 2.25rem)
		clamp(3rem, 10vw, 5rem);
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
	border-radius: 6px;
	margin: 0 auto 16px;
	max-width: 800px;
	padding: 12px 16px;
	text-align: center;
	width: 90%;
}

.app__banner--error {
	background: #fde8e8;
	border: 1px solid #c53030;
	color: #742a2a;
}

.app__main {
	margin: 0 auto;
	max-width: 1200px;
	padding-bottom: clamp(1.5rem, 4vw, 2.5rem);
}

.album__status {
	margin: 0 auto 12px;
	max-width: 800px;
	text-align: center;
	width: 70%;
}

.album__results-status {
	align-items: center;
	color: #4a5560;
	display: flex;
	gap: 0.5rem;
	grid-column: 1 / -1;
	justify-content: center;
	justify-self: stretch;
	margin: 0;
	text-align: center;
	width: 100%;
}

.album__results-placeholder {
	color: #6b7280;
	grid-column: 1 / -1;
	justify-self: stretch;
	margin: 0;
	text-align: center;
	width: 100%;
}

.album__spinner {
	animation: album-spin 0.7s linear infinite;
	border: 2px solid #d1d5db;
	border-radius: 50%;
	border-top-color: #1a5f9e;
	box-sizing: border-box;
	display: inline-block;
	flex-shrink: 0;
	height: 1.125rem;
	width: 1.125rem;
}

@keyframes album-spin {
	to {
		transform: rotate(360deg);
	}
}

.teams__nav {
	width: 100%;
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
	color: #4a5560;
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
	display: grid;
	gap: 6px;
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
	grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
	justify-items: center;
	margin: clamp(2rem, 6vw, 3rem) auto 0;
	max-width: 1200px;
}

.album__results--title {
	color: var(--theme-heading, inherit);
	font-size: 32px;
	grid-column: 1 / -1;
	justify-self: stretch;
	text-align: center;
	width: 100%;
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

@media (max-width: 480px) {
	.album__results--title {
		font-size: 22px;
	}
}
</style>

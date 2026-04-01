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
					Browse the league — one club, one roster of cards.
				</p>
			</div>
			<img src="./assets/baseball.png" alt="" class="title__img" width="100" height="100">
		</header>
		<main class="app__main">
			<div class="album__search album__search--picker">
				<p v-if="teamsLoading" class="album__status">Loading teams…</p>
				<nav class="teams__nav" aria-label="Major League Baseball teams">
					<div class="teams__picker-panel">
						<div class="teams__picker-head">
							<label class="teams__search-label" for="team-search">Find a club</label>
							<input
								id="team-search"
								v-model="teamSearchQuery"
								class="teams__search-input"
								type="search"
								name="team-search"
								placeholder="City, nickname, or ballpark…"
								autocomplete="off"
								spellcheck="false"
								:disabled="teamsLoading || !!teamsError || !teams.length"
							/>
						</div>
						<p
							v-if="!teamsLoading && teams.length && !filteredTeamSections.length"
							class="teams__search-empty"
							role="status"
						>
							No club matches “{{ teamSearchQuery.trim() }}”.
						</p>
						<template v-else>
							<section
								v-for="section in displayTeamSections"
								:key="section.id"
								class="teams__section"
							>
								<h3
									v-if="section.label"
									class="teams__section-title"
									:id="section.id"
								>
									{{ section.label }}
								</h3>
								<div
									class="teams__container"
									:role="section.label ? 'group' : undefined"
									:aria-labelledby="section.label ? section.id : undefined"
								>
									<Team
										v-for="team in section.teams"
										:key="team.id"
										:team="team"
										:selected="selectedTeamId === team.id"
										@updatePlayers="loadPlayers"
										@updateTeam="loadTeam"
										@liveMessage="setLiveMessage"
										@rosterLoading="setRosterLoading"
									/>
								</div>
							</section>
						</template>
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
					<div
						v-for="(player, dealIndex) in players"
						:key="player.person.id"
						class="album__card-deal"
						:class="{ 'album__card-deal--many': players.length > 30 }"
						:style="dealEnterStyle(dealIndex)"
					>
						<BaseballCard
							:player="player"
							:theme="theme"
							:teamName="teamName"
							:manyPlayers="players.length > 30"
						/>
					</div>
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
import { ref, computed, watch, nextTick, onMounted } from 'vue';
import BaseballCard from './components/BaseballCard.vue';
import Team from './components/Team.vue';
import http from './http-common';
import { filterMajorLeagueBaseballTeams } from './lib/filterMlbTeams';
import {
	buildTeamPickerSections,
	filterTeamPickerSections
} from './lib/teamPickerSections';

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
const teamSearchQuery = ref('');

const teamPickerSections = computed(() => buildTeamPickerSections(teams.value));

const filteredTeamSections = computed(() =>
	filterTeamPickerSections(teamPickerSections.value, teamSearchQuery.value)
);

/** While loading or empty API, avoid flashing “no matches” before sections exist. */
const displayTeamSections = computed(() => {
	if (teamsLoading.value || !teams.value.length) {
		return teamPickerSections.value;
	}
	return filteredTeamSections.value;
});

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

/** Stagger + twist for “deal from stack” entry; cap delay on huge rosters. */
function dealEnterStyle(index) {
	const total = players.value.length;
	const many = total > 30;
	const staggerMs = many ? 22 : 46;
	const maxDelayMs = many ? 520 : 1100;
	const twist = ((index % 11) - 5) * 2.15;
	const delay = Math.min(index * staggerMs, maxDelayMs);
	return {
		'--deal-delay': `${delay}ms`,
		'--deal-twist': `${twist}deg`
	};
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
 * Typography: tokens.css — Libre Franklin (UI), Oswald (chrome headings), Montserrat (cards).
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
	color: var(--color-text);
	margin: 0;
	min-height: 100vh;
	background-color: var(--color-surface);
	background-image:
		radial-gradient(ellipse 100% 60% at 50% 0%, rgba(30, 58, 95, 0.07), transparent 52%),
		radial-gradient(rgba(28, 25, 23, 0.045) 0.65px, transparent 0.65px);
	background-size:
		100% 100%,
		9px 9px;
}

@media (prefers-color-scheme: dark) {
	body {
		background-image:
			radial-gradient(ellipse 100% 55% at 50% 0%, rgba(147, 197, 253, 0.06), transparent 50%),
			radial-gradient(rgba(255, 255, 255, 0.035) 0.65px, transparent 0.65px);
		background-size:
			100% 100%,
			9px 9px;
	}
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
	border: 2px solid var(--color-ui-ink);
	border-radius: 0;
	box-shadow: 3px 3px 0 var(--color-ui-crimson);
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
	border-top-color: var(--color-ui-gum);
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
	border-bottom: 3px solid var(--color-ui-ink);
	box-shadow:
		0 4px 0 0 var(--color-ui-crimson),
		inset 0 1px 0 0 rgba(255, 252, 246, 0.45);
	padding-block: var(--space-4) var(--space-5);
	position: sticky;
	top: env(safe-area-inset-top, 0px);
	width: 100%;
	z-index: 10;
}

@media (prefers-color-scheme: dark) {
	.teams__nav {
		box-shadow:
			0 4px 0 0 var(--color-ui-crimson),
			inset 0 1px 0 0 rgba(255, 255, 255, 0.06);
	}
}

h1,
h2 {
	font-family: var(--font-ui-heading);
	text-align: center;
}

.app__title {
	align-items: center;
	border-bottom: 3px double var(--color-ui-ink);
	display: flex;
	flex-wrap: wrap;
	gap: 0.75rem 1.25rem;
	justify-content: center;
	margin: 0 auto clamp(1.25rem, 4vw, 2rem);
	max-width: 1100px;
	padding-bottom: clamp(1rem, 3vw, 1.35rem);
	width: 100%;
}

.app__title-text {
	flex: 1 1 100%;
	text-align: center;
}

.app__title-subtitle {
	color: var(--color-text-muted);
	font-family: var(--font-ui);
	font-size: clamp(0.7rem, 1.85vw, 0.8125rem);
	font-weight: 600;
	letter-spacing: 0.16em;
	line-height: 1.5;
	margin: 0.5rem auto 0;
	max-width: 36em;
	text-transform: uppercase;
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

.album__search--picker {
	max-width: min(56rem, 100%);
}

.teams__picker-panel {
	background: var(--color-surface-elevated);
	border: 2px solid var(--color-ui-ink);
	box-shadow: 4px 4px 0 rgba(28, 25, 23, 0.08);
	margin-inline: auto;
	padding: clamp(var(--space-4), 2.5vw, var(--space-6));
}

@media (prefers-color-scheme: dark) {
	.teams__picker-panel {
		box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.35);
	}
}

.teams__picker-head {
	display: flex;
	flex-direction: column;
	gap: var(--space-2);
	margin-bottom: var(--space-5);
	max-width: 28rem;
	width: 100%;
}

.teams__search-label {
	color: var(--color-text-muted);
	font-family: var(--font-ui-heading);
	font-size: 0.8125rem;
	font-weight: 600;
	letter-spacing: 0.12em;
	text-transform: uppercase;
}

.teams__search-input {
	-webkit-appearance: none;
	appearance: none;
	background: var(--color-surface);
	border: 2px solid var(--color-ui-ink);
	color: var(--color-text);
	font-family: var(--font-ui);
	font-size: 1rem;
	line-height: 1.35;
	min-height: 2.75rem;
	padding: 0.5rem 0.75rem;
	width: 100%;
}

.teams__search-input::placeholder {
	color: var(--color-text-muted);
	opacity: 1;
}

.teams__search-input:disabled {
	cursor: not-allowed;
	opacity: 0.55;
}

.teams__search-input:focus {
	outline: none;
}

.teams__search-input:focus-visible {
	box-shadow:
		0 0 0 3px var(--color-focus-ring),
		0 0 0 5px var(--color-ui-gum);
}

.teams__search-empty {
	color: var(--color-text-muted);
	font-size: 0.9375rem;
	margin: 0 0 var(--space-4);
	text-align: center;
}

.teams__section + .teams__section {
	margin-top: var(--space-6);
}

.teams__section-title {
	border-bottom: 2px solid var(--color-ui-crimson);
	color: var(--color-ui-ink);
	font-family: var(--font-ui-heading);
	font-size: clamp(0.9375rem, 2.2vw, 1.125rem);
	font-weight: 600;
	letter-spacing: 0.06em;
	margin: 0 0 var(--space-4);
	padding-bottom: var(--space-2);
	text-align: left;
	text-transform: uppercase;
}

@media (prefers-color-scheme: dark) {
	.teams__section-title {
		color: var(--color-text);
	}
}

.album__search--title {
	font-size: clamp(1.85rem, 5vw, 2.75rem);
	font-weight: 600;
	letter-spacing: 0.05em;
	line-height: 1.12;
	margin: 0;
	text-transform: uppercase;
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

@media (min-width: 1440px) {
	.teams__container {
		grid-template-columns: repeat(5, minmax(0, 1fr));
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
	border-top: 2px solid var(--color-border-medium);
	display: grid;
	gap: clamp(1rem, 3vw, 1.5rem);
	grid-template-columns: repeat(auto-fill, minmax(min(250px, 100%), 1fr));
	justify-items: center;
	margin: clamp(2rem, 6vw, 3rem) auto 0;
	max-width: 1200px;
	padding-top: clamp(1.5rem, 4vw, 2.25rem);
	/* Taller sticky picker (search + leagues): keep cards clear of the fold */
	scroll-margin-top: calc(0.75rem + min(28vh, 220px) + env(safe-area-inset-top, 0px));
}

.album__results--many-cards {
	--shadow-card: var(--shadow-card-large-roster);
}

/* Roster cards: staggered “deal” from stack → grid */
@keyframes album-card-deal {
	0% {
		opacity: 0;
		transform: translateY(var(--deal-rise, min(26vh, 8.5rem))) scale(0.93) rotateZ(var(--deal-twist, 0deg));
	}
	55% {
		opacity: 1;
	}

	72% {
		transform: translateY(-5px) scale(1.012) rotateZ(calc(var(--deal-twist, 0deg) * 0.12));
	}

	100% {
		opacity: 1;
		transform: translateY(0) scale(1) rotateZ(0deg);
	}
}

.album__card-deal {
	--deal-rise: min(26vh, 8.5rem);
	animation: album-card-deal 0.74s cubic-bezier(0.24, 0.92, 0.32, 1) both;
	animation-delay: var(--deal-delay, 0ms);
	justify-self: center;
	max-width: 280px;
	width: 100%;
}

.album__card-deal--many {
	--deal-rise: min(17vh, 5.25rem);
	animation-duration: 0.5s;
	animation-timing-function: cubic-bezier(0.28, 0.88, 0.36, 1);
}

@media (prefers-reduced-motion: reduce) {
	.album__card-deal {
		animation: none;
		opacity: 1;
		transform: none;
	}
}

.album__results:focus {
	outline: none;
}

.album__results:focus-visible {
	box-shadow:
		0 0 0 3px var(--color-focus-ring),
		0 0 0 5px var(--color-ui-gum);
	outline: 2px solid transparent;
}

.album__results--title {
	color: var(--theme-heading, var(--color-text));
	font-size: clamp(1.2rem, 3.6vw, 1.85rem);
	font-weight: 600;
	grid-column: 1 / -1;
	justify-self: stretch;
	letter-spacing: 0.04em;
	line-height: 1.2;
	text-align: center;
	text-transform: uppercase;
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

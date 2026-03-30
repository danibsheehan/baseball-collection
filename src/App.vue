<template>
	<div id="app">
		<p class="visually-hidden" aria-live="polite" aria-atomic="true">{{ liveRegionText }}</p>
		<div v-if="teamsError" class="app__banner app__banner--error" role="alert">
			{{ teamsError }}
		</div>
		<header class="app__title">
			<img src="./assets/baseball.png" alt="" class="title__img">
			<h1 class="album__search--title">Pick a Team and Get Your Cards!</h1>
			<img src="./assets/baseball.png" alt="" class="title__img">
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
							@updatePlayers="loadPlayers"
							@updateTeam="loadTeam"
							@liveMessage="setLiveMessage"
						/>
					</div>
				</nav>
			</div>
			<section class="album__results" aria-label="Player cards">
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
const teams = ref([]);
const theme = ref('');
const teamsLoading = ref(true);
const teamsError = ref('');
const liveRegionText = ref('');

function loadPlayers(nextPlayers) {
	players.value = nextPlayers;
}

function loadTeam(team) {
	theme.value = team.teamCode?.toLowerCase() || '';
	teamName.value = team.name;
}

function setLiveMessage(message) {
	liveRegionText.value = message;
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

<style scoped>
#app {
	font-family: 'Mukta', sans-serif;
	margin-top: 50px;
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
}

.album__status {
	margin: 0 auto 12px;
	max-width: 800px;
	text-align: center;
	width: 70%;
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
	flex-wrap: nowrap;
	justify-content: space-evenly;
	margin: 20px auto;
	width: 95%;
}

.title__img {
	height: 100px;
}

.album__search {
	margin: 0 auto;
	max-width: 800px;
	width: 70%;
}

.album__search--title {
	font-size: 42px;
	margin: 0 15px;
}

.teams__container {
	display: flex;
	flex-wrap: wrap;
	width: 100%;
}

.album__results {
	display: flex;
	flex-wrap: wrap;
	justify-content: center;
	margin: 50px auto;
	max-width: 1200px;
}

.album__results--title {
	color: var(--theme-heading, inherit);
	font-size: 32px;
	width: 100%;
}

@media (max-width: 760px) {
	.album__search--title {
		font-size: 36px;
	}

	.title__img {
		height: 80px;
	}

	.album__search {
		width: 90%;
	}
}

@media (max-width: 480px) {
	.album__search--title {
		font-size: 28px;
	}

	.album__results--title {
		font-size: 22px;
	}

	.title__img {
		height: 50px;
	}
}
</style>

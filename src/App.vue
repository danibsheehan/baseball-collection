<template>
	<div id="app">
		<div class="app__title">
			<img src="./assets/baseball.png" alt="" class="title__img">
			<h1 class="album__search--title">Pick a Team and Get Your Cards!</h1>
			<img src="./assets/baseball.png" alt="" class="title__img">
		</div>
		<div class="album__search">
			<div class="teams__container">
				<Team v-for="team in teams" :key="team.id" :team="team" @updatePlayers="loadPlayers" @updateTeam="loadTeam" />
			</div>
		</div>
		<div class="album__results">
			<h2
				class="album__results--title"
				v-if="players.length"
				:data-theme="theme || undefined"
			>Your Baseball Cards for the {{teamName}}!</h2>
			<BaseballCard
				v-for="player in players"
				:key="player.person.id"
				:player="player"
				:theme="theme"
				:teamName="teamName"
			/>
		</div>
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

function loadPlayers(nextPlayers) {
	players.value = nextPlayers;
}

function loadTeam(team) {
	theme.value = team.teamCode?.toLowerCase() || '';
	teamName.value = team.name;
}

onMounted(() => {
	teams.value = [];
	http.get('teams')
		.then((response) => {
			const data = filterMajorLeagueBaseballTeams(response.data.teams || []).sort(
				(a, b) => String(a.name || '').localeCompare(String(b.name || ''), undefined, { sensitivity: 'base' })
			);
			teams.value = data;
		})
		.catch((err) => {
			console.error('teams request failed', err);
			teams.value = [];
		});
});
</script>

<style scoped>
#app {
	font-family: 'Mukta', sans-serif;
	margin-top: 50px;
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

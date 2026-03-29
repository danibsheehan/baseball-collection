<template>
	<div id="app">
		<div class="app__title">
			<img src="./assets/baseball.png" alt="" class="title__img">
			<h1 class="album__search--title">Pick a Team and Get Your Cards!</h1>
			<img src="./assets/baseball.png" alt="" class="title__img">
		</div>
		<div class="album__search">
			<div class="teams__container">
				<Team v-for="(team, i) in teams" :key="i" :team="team" @updatePlayers="loadPlayers" @updateTeam="loadTeam" />
			</div>
		</div>
		<div class="album__results">
			<h2 class="album__results--title" v-if="players.length" :class="theme">Your Baseball Cards for the {{teamName}}!</h2>
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
			const data = (response.data.teams || []).filter(
				(t) => t.sport && t.sport.name === 'Major League Baseball'
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
	font-size: 32px;
	width: 100%;
}

.album__results--title.atl {
	color: rgb(22, 40, 79);
}

.album__results--title.bos {
	color: rgb(25, 44, 85);
}

.album__results--title.ari,
.album__results--title.bal,
.album__results--title.cha,
.album__results--title.cin,
.album__results--title.col,
.album__results--title.mia,
.album__results--title.pit,
.album__results--title.sfn {
	color: rgb(0, 0, 0);
}

.album__results--title.chn {
	color: rgb(39, 59, 129);
}

.album__results--title.cle {
	color: rgb(26, 46, 90);
}

.album__results--title.det {
	color: rgb(24, 45, 85);
}

.album__results--title.hou {
	color: rgb(30, 49, 96);
}

.album__results--title.kca {
	color: rgb(23, 72, 133);
}

.album__results--title.ana {
	color: rgb(0, 50, 99);
}

.album__results--title.lan {
	color: rgb(0, 90, 156);
}

.album__results--title.mil {
	color: rgb(26, 37, 80);
}

.album__results--title.min {
	color: rgb(26, 46, 90);
}

.album__results--title.nyn {
	color: rgb(0, 45, 114);
}

.album__results--title.nya {
	color: rgb(18, 36, 72);
}

.album__results--title.ath {
	color: rgb(1, 56, 49);
}

.album__results--title.phi {
	color: rgb(40, 73, 153);
}

.album__results--title.sdn {
	color: rgb(30, 49, 96);
}

.album__results--title.sea {
	color: rgb(24, 45, 85);
}

.album__results--title.sln {
	color: rgb(34, 32, 95);
}

.album__results--title.tba {
	color: rgb(27, 47, 91);
}

.album__results--title.tex {
	color: rgb(35, 57, 116);
}

.album__results--title.tor {
	color: rgb(30, 46, 92);
}

.album__results--title.was {
	color: rgb(33, 39, 89);
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

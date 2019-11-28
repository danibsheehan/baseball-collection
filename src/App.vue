<template>
	<div id="app">
		<div class="app__title">
			<img src="./assets/baseball.png" alt="" class="title__img">
			<h1 class="album__search--title">Pick a Team and Get Your Cards!</h1>
			<img src="./assets/baseball.png" alt="" class="title__img">
		</div>
		<div class="album__search">
			<div class="teams__container">
				<team v-for="(team, i) in teams" :key="i" :team="team" @updatePlayers="loadPlayers" @updateTeam="loadTeam"></team>
			</div>
		</div>
		<div class="album__results">
			<h2 class="album__results--title" v-if="players.length" :class="theme">Your Baseball Cards for the {{teamCity}} {{teamName}}!</h2>
			<baseball-card v-for="player in players" :key="player.PlayerID" :player="player">
			</baseball-card>
		</div>
	</div>
</template>

<script>
import BaseballCard from './components/BaseballCard';
import Team from './components/Team';
import http from './http-common';

export default {
	name: 'app',
	components: {
		BaseballCard,
		Team
	},
	data: () => ({
		players: [],
		teamCity: '',
		teamName: '',
		teams: [],
		theme: ''
	}),
	mounted() {
		this.teams = [];
		http.get(`teams`)
			.then(response => {
				const data = response.data;
				this.teams = data.sort((a, b) => a.Key.localeCompare(b.Key, 'en', {'sensitivity': 'base'}));
			})
			.catch(() => {
				this.teams = [];
			})
	},
	methods: {
		loadPlayers(players) {
			this.players = players;
		},
		loadTeam(team) {
			this.teamCity = team.City;
			this.theme = team.Key.toLowerCase();
			this.teamName = team.Name;
		}
	}
}
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
.album__results--title.chw,
.album__results--title.cin,
.album__results--title.col,
.album__results--title.mia,
.album__results--title.pit,
.album__results--title.sf {
	color: rgb(0, 0, 0);
}

.album__results--title.chc {
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

.album__results--title.kc {
	color: rgb(23, 72, 133);
}

.album__results--title.laa {
	color: rgb(0, 50, 99);
}

.album__results--title.lad {
	color: rgb(0, 90, 156);
}

.album__results--title.mil {
	color: rgb(26, 37, 80);
}

.album__results--title.min {
	color: rgb(26, 46, 90);
}

.album__results--title.nym {
	color: rgb(0, 45, 114);
}

.album__results--title.nyy {
	color: rgb(18, 36, 72);
}

.album__results--title.oak {
	color: rgb(1, 56, 49);
}

.album__results--title.phi {
	color: rgb(40, 73, 153);
}

.album__results--title.sd {
	color: rgb(30, 49, 96);
}

.album__results--title.sea {
	color: rgb(24, 45, 85);
}

.album__results--title.stl {
	color: rgb(34, 32, 95);
}

.album__results--title.tb {
	color: rgb(27, 47, 91);
}

.album__results--title.tex {
	color: rgb(35, 57, 116);
}

.album__results--title.tor {
	color: rgb(30, 46, 92);
}

.album__results--title.wsh {
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

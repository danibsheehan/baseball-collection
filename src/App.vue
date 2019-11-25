<template>
	<div id="app">
		<div class="album__search">
			<h1 class="album__search--title">Pick a Team and Get Your Cards!</h1>
			<div class="teams__container">
				<team v-for="(team, i) in teams" :key="i" :team="team" @update="loadPlayers"></team>
			</div>
		</div>
		<div class="album__results">
			<h2 class="album__results--title" v-if="players.length">Your Baseball Cards</h2>
			<baseball-card v-for="player in players" :key="player.PlayerID" :player="player">
			</baseball-card>
		</div>
	</div>
</template>

<script>
import BaseballCard from './components/BaseballCard';
import Team from './components/Team';
import axios from 'axios';

export default {
	name: 'app',
	components: {
		BaseballCard,
		Team
	},
	data: () => ({
		teams: [],
		players: []
	}),
	mounted() {
		this.teams = [];
		axios.get(`https://api.sportsdata.io/v3/mlb/scores/json/teams?key=a5ab22c5a0e3407c9cc72de8ec2561ae`)
			.then(response => {
				const data = response.data;
				this.teams = data.sort((a, b) => (a.City > b.City) ? 1 : -1);
			})
			.catch(() => {
				this.teams = [];
			})
	},
	methods: {
		loadPlayers(players) {
			this.players = players;
		}
	}
}
</script>

<style scoped>
#app {
	font-family: "Avenir", Helvetica, Arial, sans-serif;
	margin-top: 50px;
}

h1,
h2 {
	text-align: center;
	width: 100%;
}

.album__search {
	margin: 0 auto;
	max-width: 800px;
	width: 65%;
}

.album__sear--title {
	font-size: 42px;
}

.teams__container {
	display: flex;
	flex-wrap: wrap;
	width: 100%;
}

.team {
	background-color: white;
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
}

@media (max-width: 760px) {
	.album__search {
		width: 90%;
	}
}
</style>

<template>
	<button class="team" @click="searchPlayers">{{team.City}} {{team.Name}}</button>
</template>

<script>
import axios from 'axios';

export default {
	name: 'Team',
	props: {
		team: {
			type: Object
		}
	},
	data: () => ({
		players: []
	}),
	methods: {
		searchPlayers() {
			this.players = [];
			axios.get(`https://api.sportsdata.io/v3/mlb/scores/json/Players/${this.team.Key}?key=a5ab22c5a0e3407c9cc72de8ec2561ae`)
				.then(response => {
					this.players = response.data.filter(player => player.Status === 'Active');
					this.$emit('update', this.players);
				})
				.catch(() => {
					this.players = [];
				});
		}
	}
}
</script>

<style scoped>
	.team {
		border: 1px solid black;
		padding: 10px 0;
		width: 33%;
	}

	.team:hover {
		background-color: black;
		color: white;
	}

	.team:focus {
		outline: none;
	}
</style>>

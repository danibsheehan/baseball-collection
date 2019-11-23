import BaseballCard from '../BaseballCard';
import Team from '../Team';
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
				this.teams = response.data;
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

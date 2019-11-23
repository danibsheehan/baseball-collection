import PlayerName from '../PlayerName';
import PlayerTeam from '../PlayerTeam';

export default {
	name: 'BaseballCard',
	components: {
		PlayerName,
		PlayerTeam
	},
	props: {
		player: {
			type: Object
		}
	},
    data: () => ({
		theme: '',
		flipped: false
	}),
	mounted() {
		this.theme = this.player.Team.toLowerCase();
	},
	methods: {
		flipCard() {
			this.flipped = !this.flipped;
		}
	}
}

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
		teamLogo: ''
	}),
	mounted() {
		this.teamLogo = `card__logo card__logo--${this.player.Team.toLowerCase()}`;
	}
}

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
	}
}

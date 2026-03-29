<template>
	<div class="card">
		<div class="card__container--back">
			<player-logo :theme="theme"></player-logo>
			<player-info :playerInfo="playerInfo" :theme="theme" :teamName="teamName"></player-info>
		</div>
	</div>
</template>

<script>
import PlayerInfo from './PlayerInfo.vue';
import PlayerLogo from './PlayerLogo.vue';
import http from '../http-common';

export default {
	name: 'CardBack',
	components: {
		PlayerInfo,
		PlayerLogo
	},
	props: {
		player: {
			type: Object
		},
		teamName: {
			type: String
		},
		theme: {
			type: String
		}
	},
	data: () => ({
		playerInfo: {}
	}),
	mounted() {
		http.get(`people/${this.player.person.id}`)
			.then(response => {
				this.playerInfo = response.data.people[0];
			})
			.catch((err) => {
				console.error('player request failed', err);
				this.playerInfo = {};
			})
	}

}
</script>

<style scoped>
.card {
	background: url('../assets/baseballs.jpg') center/cover;
	background-color: rgba(242, 247, 245, .5);
	backface-visibility: hidden;
	height: 100%;
	left: 0;
	position: absolute;
	top: 0;
	transform: rotateY(180deg);
	width: 100%;
}

.card__container--back {
	height: 100%;
}

.card__container--back .card__logo {
	background-color: rgba(242, 247, 245, .5);
	left: 5px;
	top: 5px;
}
</style>

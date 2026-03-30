<template>
	<div class="card" :class="{ 'card--large-roster': manyPlayers }">
		<div class="card__container--back">
			<PlayerLogo />
			<PlayerInfo :playerInfo="playerInfo" :teamName="teamName" />
		</div>
	</div>
</template>

<script setup>
import PlayerInfo from './PlayerInfo.vue';
import PlayerLogo from './PlayerLogo.vue';

defineProps({
	player: {
		type: Object
	},
	playerInfo: {
		type: Object,
		default: () => ({})
	},
	teamName: {
		type: String
	},
	manyPlayers: {
		type: Boolean,
		default: false
	}
});
</script>

<style scoped>
.card {
	background: url('../assets/baseballs.jpg') center/cover;
	background-color: rgba(242, 247, 245, .5);
	backface-visibility: hidden;
	border-radius: 10px;
	height: 100%;
	left: 0;
	overflow: hidden;
	position: absolute;
	top: 0;
	transform: rotateY(180deg);
	width: 100%;
}

.card--large-roster {
	background-image: none;
	background: linear-gradient(145deg, #f2f7f5 0%, #e4ebe8 100%);
}

@media (prefers-color-scheme: dark) {
	.card--large-roster {
		background: linear-gradient(145deg, #2a302e 0%, #1c2220 100%);
	}
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

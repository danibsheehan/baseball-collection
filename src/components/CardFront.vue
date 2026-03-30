<template>
	<div class="card">
		<div class="card__container--front">
			<div class="card__top">
				<PlayerImage
					:playerId="player.person.id"
					:imageDescription="player.person.fullName"
				/>
			</div>
			<div class="card__bottom">
				<PlayerName :fullName="player.person.fullName" />
				<PlayerLogo />
			</div>
		</div>
	</div>
</template>

<script setup>
import PlayerImage from './PlayerImage.vue';
import PlayerName from './PlayerName.vue';
import PlayerLogo from './PlayerLogo.vue';

defineProps({
	player: {
		type: Object
	}
});
</script>

<style scoped>
.card {
	backface-visibility: hidden;
	background-color: rgba(242, 247, 245, .5);
	border-radius: 10px;
	height: 100%;
	left: 0;
	overflow: hidden;
	position: absolute;
	top: 0;
	width: 100%;
}

.card__container--front {
	backface-visibility: hidden;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	height: 100%;
	position: relative;
}

.card__top {
	border-bottom: 4px solid var(--theme-card-top-border, black);
	border-bottom-right-radius: 10px;
	border-right: 4px solid var(--theme-card-top-border, black);
	padding-bottom: 5%;
	width: 95%;
}

.card__bottom {
	height: 100%;
	position: relative;
}
</style>

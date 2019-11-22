<template>
	<div class="card__container">
		<div class="card__container--front">
			<img :src="player.PhotoUrl" class="card__image"/>
			<player-team :teamString="player.Team"></player-team>
			<player-name :firstName="player.FirstName" :lastName="player.LastName"></player-name>
		</div>
	</div>
</template>

<script src="./js/baseballCard.js"></script>

<style scoped>
	@import './css/baseballCard.css';
</style>

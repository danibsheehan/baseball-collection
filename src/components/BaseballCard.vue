<template>
	<div class="card__container">
		<div class="card__container--front">
			<div class="card__border"></div>
			<span class="card__image">
				<img :src="player.PhotoUrl" class="card__image--player"/>
			</span>
			<span :class="teamLogo"></span>
			<player-name :firstName="player.FirstName" :lastName="player.LastName"></player-name>
			<player-team :position="player.Position" :team="player.Team"></player-team>
		</div>
	</div>
</template>

// <script src="./js/baseballCard.js"></script>

<style scoped>
	@import './css/baseballCard.css';
</style>

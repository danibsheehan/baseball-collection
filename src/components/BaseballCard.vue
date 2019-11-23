<template>
	<div class="card__container" @click="flipCard" v-bind:class="{ 'show-back': flipped }">
		<div class="card__container--front">
			<div class="card__top" :class="theme">
				<span class="card__image" :class="theme">
					<img :src="player.PhotoUrl" class="card__image--player"/>
				</span>
			</div>
			<div class="card__bottom">
				<span class="card__logo" :class="theme"></span>
				<player-name :firstName="player.FirstName" :lastName="player.LastName" :theme="theme"></player-name>
			</div>
		</div>
		<div class="card__container--back">
			Hi
		</div>
	</div>
</template>

<script src="./js/baseballCard.js"></script>

<style scoped>
	@import './css/baseballCard.css';
</style>

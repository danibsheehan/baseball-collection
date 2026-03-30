<template>
	<span class="card__logo" aria-hidden="true"></span>
</template>

<style scoped>
.card__logo {
	background-image: url('..//assets/mlb-logos-1.0.svg');
	background-position: var(--theme-logo-bg-pos, 0 0);
	border: 2px solid var(--theme-logo-border, black);
	border-radius: 50%;
	bottom: 5px;
	position: absolute;
	height: 0;
	padding-bottom: 30px;
	right: 5px;
	width: 30px;
}
</style>

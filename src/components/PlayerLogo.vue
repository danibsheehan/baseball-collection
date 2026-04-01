<template>
	<span
		class="card__logo"
		:class="{ 'card__logo--start': align === 'start' }"
		aria-hidden="true"
	></span>
</template>

<script setup>
defineProps({
	align: {
		type: String,
		default: 'end',
		validator: (v) => v === 'start' || v === 'end'
	}
});
</script>

<style scoped>
/* Match .team__logo: sprite is authored for a 30×30 cell; scale from center inside the circle. */
.card__logo {
	border: 2px solid var(--theme-logo-border, black);
	border-radius: 50%;
	bottom: 5px;
	height: 30px;
	overflow: hidden;
	position: absolute;
	right: 5px;
	width: 30px;
}

.card__logo--start {
	left: 5px;
	right: auto;
}

.card__logo::before {
	background-image: url('../assets/mlb-logos-1.0.svg');
	background-position: var(--theme-logo-bg-pos, 0 0);
	background-repeat: no-repeat;
	background-size: 900px 900px;
	content: '';
	height: 30px;
	left: 50%;
	position: absolute;
	top: 50%;
	transform: translate(-50%, -50%) scale(calc(26 / 30));
	width: 30px;
}
</style>

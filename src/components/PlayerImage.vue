<template>
	<span ref="root" class="card__image">
		<img
			v-if="shouldLoadImage"
			:src="headshotSrc"
			class="card__image--player"
			loading="lazy"
			decoding="async"
			alt=""
		/>
	</span>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';

const props = defineProps({
	playerId: {
		type: Number
	}
});

const root = ref(null);
const shouldLoadImage = ref(false);

const headshotSrc = computed(
	() =>
		`https://img.mlbstatic.com/mlb/images/players/head_shot/${props.playerId}.jpg`
);

let observer;

onMounted(() => {
	if (typeof IntersectionObserver === 'undefined') {
		shouldLoadImage.value = true;
		return;
	}
	observer = new IntersectionObserver(
		(entries) => {
			if (entries.some((e) => e.isIntersecting)) {
				shouldLoadImage.value = true;
				observer?.disconnect();
				observer = undefined;
			}
		},
		{ rootMargin: '320px 0px', threshold: 0 }
	);
	if (root.value) {
		observer.observe(root.value);
	}
});

onBeforeUnmount(() => {
	observer?.disconnect();
});
</script>

<style scoped>
.card__image {
	border-bottom: 2px solid var(--theme-headshot-border, black);
	border-bottom-right-radius: 10px;
	border-right: 2px solid var(--theme-headshot-border, black);
	color: var(--theme-headshot-tint, rgb(240, 243, 247));
	float: left;
	min-height: 200px;
	position: relative;
	width: 95%;
}

.card__image::after {
	border-bottom-right-radius: 10px;
	box-shadow: 30px 0 25px -20px inset, -30px 0 25px -20px inset;
	content: "";
	height: 100%;
	left: 0;
	position: absolute;
	top: 0;
	width: 100%;
}

.card__image--player {
	height: 100%;
	left: 0;
	position: absolute;
	object-fit: contain;
	top: 0;
	width: 100%;
}
</style>

<template>
	<!-- Porthole: outer ring (padding) + inner clip; img in-flow so overflow:hidden reliably clips (no absolute + compositor bleed). -->
	<div v-if="porthole" ref="root" class="card-porthole">
		<div class="card-porthole__clip">
			<img
				v-if="shouldLoadImage && headshotSrc"
				:src="headshotSrc"
				class="card-porthole__img"
				loading="eager"
				fetchpriority="high"
				decoding="async"
				:alt="headshotAlt"
			/>
		</div>
	</div>
	<span v-else ref="root" class="card__image">
		<img
			v-if="shouldLoadImage && headshotSrc"
			:src="headshotSrc"
			class="card__image--player"
			loading="lazy"
			decoding="async"
			:alt="headshotAlt"
		/>
	</span>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';

const props = defineProps({
	playerId: {
		type: [Number, String],
		default: undefined
	},
	imageDescription: {
		type: String,
		default: ''
	},
	porthole: {
		type: Boolean,
		default: false
	}
});

const headshotAlt = computed(() => {
	const name = props.imageDescription?.trim();
	return name ? `Headshot of ${name}` : '';
});

const root = ref(null);
const shouldLoadImage = ref(false);

const headshotSrc = computed(() => {
	const id = props.playerId;
	if (id == null || id === '') {
		return '';
	}
	return `https://img.mlbstatic.com/mlb/images/players/head_shot/${id}.jpg`;
});

let observer;

onMounted(() => {
	if (props.porthole || typeof IntersectionObserver === 'undefined') {
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

.card-porthole {
	background: var(--color-paper-gloss);
	border-radius: 50%;
	box-shadow:
		0 2px 8px rgba(0, 0, 0, 0.28),
		inset 0 0 0 1px rgba(0, 0, 0, 0.08);
	box-sizing: border-box;
	inset: 0;
	min-height: 0;
	padding: 3px;
	position: absolute;
}

.card-porthole__clip {
	border-radius: 50%;
	height: 100%;
	min-height: 0;
	overflow: hidden;
	position: relative;
	width: 100%;
}

.card-porthole__clip::after {
	border-radius: 50%;
	box-shadow: inset 0 0 18px rgba(0, 0, 0, 0.14);
	content: "";
	inset: 0;
	pointer-events: none;
	position: absolute;
	z-index: 1;
}

.card-porthole__img {
	display: block;
	height: 100%;
	object-fit: cover;
	object-position: center center;
	width: 100%;
}
</style>

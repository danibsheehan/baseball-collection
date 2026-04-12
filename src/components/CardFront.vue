<template>
	<div class="card card--1959" :class="{ 'card--many': manyPlayers }">
		<div class="card__1959-frame">
			<p class="card__1959-name">{{ displayName }}</p>
			<div class="card__1959-photo-slot">
				<div class="card__1959-porthole">
					<div class="card__1959-photo">
						<PlayerImage
							:playerId="player.person.id"
							:imageDescription="player.person.fullName"
							porthole
						/>
					</div>
				</div>
			</div>
			<div class="card__1959-bottom">
				<PlayerLogo align="start" />
				<div class="card__1959-caption">
					<span v-if="positionName" class="card__1959-pos">{{ positionName }}</span>
					<span v-if="teamName" class="card__1959-team">{{ teamName }}</span>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed } from 'vue';
import PlayerImage from './PlayerImage.vue';
import PlayerLogo from './PlayerLogo.vue';

const props = defineProps({
	player: {
		type: Object
	},
	teamName: {
		type: String,
		default: ''
	},
	positionName: {
		type: String,
		default: ''
	},
	manyPlayers: {
		type: Boolean,
		default: false
	}
});

const displayName = computed(() =>
	String(props.player?.person?.fullName ?? '').trim()
);
</script>

<style scoped>
/* 1959 Topps–inspired: team-color field, white mat, circular photo, angled name (Archivo). */
.card {
	backface-visibility: hidden;
	background-color: var(--theme-1959-field, var(--theme-card-top-border, #1a2740));
	border-radius: 10px;
	box-shadow: inset 0 0 0 3px var(--color-paper-gloss);
	height: 100%;
	left: 0;
	overflow: hidden;
	position: absolute;
	top: 0;
	width: 100%;
}

/* Behind face content so the photo stays visible (was z-index: 2 on top of everything). */
.card::after {
	background:
		linear-gradient(125deg, var(--card-sheen-edge) 0%, transparent 38%),
		linear-gradient(
			305deg,
			transparent 22%,
			var(--card-sheen-mid) 42%,
			var(--card-sheen-highlight) 50%,
			var(--card-sheen-mid) 58%,
			transparent 78%
		),
		radial-gradient(145% 95% at 50% -8%, var(--card-sheen-highlight), transparent 62%);
	border-radius: 10px;
	content: "";
	inset: 0;
	opacity: 0.52;
	pointer-events: none;
	position: absolute;
	z-index: 0;
}

.card--many::after {
	opacity: 0.34;
}

:global(html[data-card-foil-webgl]) .card::after {
	opacity: 0.18;
}

:global(html[data-card-foil-webgl]) .card--many::after {
	opacity: 0.1;
}

.card__1959-frame {
	align-items: stretch;
	backface-visibility: hidden;
	box-sizing: border-box;
	container-name: card-face;
	container-type: inline-size;
	display: flex;
	flex-direction: column;
	gap: 0.12rem;
	height: 100%;
	isolation: isolate;
	min-height: 0;
	/* Tight bottom inset so crest / position / team sit near the lower edge */
	padding: 3.25% 3% 0.2rem;
	position: relative;
	z-index: 1;
}

.card__1959-name {
	color: var(--theme-1959-name, var(--color-paper-gloss));
	font-family: var(--font-card);
	font-size: 0.95rem;
	/* cqi scales with card width, not the viewport */
	font-size: clamp(0.82rem, 7.5cqi, 1.08rem);
	font-style: italic;
	font-weight: 700;
	letter-spacing: 0.04em;
	line-height: 1.15;
	margin: 0;
	padding: 0 2%;
	text-align: center;
	text-shadow:
		0 1px 0 rgba(0, 0, 0, 0.45),
		0 2px 6px rgba(0, 0, 0, 0.25);
	text-transform: none;
	transform: rotate(-4deg);
}

/* Fills space between name and footer; size query = largest square that fits */
.card__1959-photo-slot {
	align-items: center;
	box-sizing: border-box;
	container-name: card-photo;
	container-type: size;
	display: flex;
	flex: 1 1 auto;
	justify-content: center;
	min-height: 0;
	overflow: hidden;
}

/* Square inscribed in the slot (min of slot width & height) */
.card__1959-porthole {
	aspect-ratio: 1;
	box-sizing: border-box;
	flex-shrink: 0;
	margin: 0;
	max-height: 100%;
	position: relative;
	width: 100%;
}

@supports (width: min(1cqw, 1cqh)) {
	.card__1959-porthole {
		max-height: none;
		width: min(100cqw, 100cqh);
	}

	.card--many .card__1959-porthole {
		width: min(92cqw, 100cqh);
	}
}

/* Photo fills the square; PlayerImage root (.card-porthole) is a circle inside */
.card__1959-photo {
	inset: 0;
	position: absolute;
}

.card__1959-bottom {
	align-items: center;
	display: flex;
	flex-shrink: 0;
	gap: 0.35rem;
	justify-content: space-between;
	min-height: 2.35rem;
	padding: 0;
	position: relative;
}

.card__1959-caption {
	display: flex;
	flex: 1;
	flex-direction: column;
	gap: 0.1rem;
	line-height: 1.1;
	padding-bottom: 0;
	text-align: right;
	text-transform: uppercase;
}

.card__1959-pos {
	color: var(--theme-1959-caption-a);
	font-size: 0.62rem;
	font-weight: 700;
	letter-spacing: 0.12em;
	text-shadow: var(--theme-1959-caption-shadow, 0 1px 2px rgba(0, 0, 0, 0.35));
}

.card__1959-team {
	color: var(--theme-1959-caption-b);
	font-size: 0.58rem;
	font-weight: 700;
	letter-spacing: 0.1em;
	text-shadow: var(--theme-1959-caption-shadow, 0 1px 2px rgba(0, 0, 0, 0.35));
}

.card__1959-bottom :deep(.card__logo) {
	background-color: var(--color-paper-gloss-soft);
	box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
	position: relative;
	bottom: auto;
	left: auto;
	right: auto;
	flex-shrink: 0;
}
</style>

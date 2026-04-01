<template>
	<div class="card card--1959" :class="{ 'card--many': manyPlayers }">
		<div class="card__1959-frame">
			<p class="card__1959-name">{{ displayName }}</p>
			<div class="card__1959-porthole">
				<div class="card__1959-photo">
					<PlayerImage
						:playerId="player.person.id"
						:imageDescription="player.person.fullName"
						porthole
					/>
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
	String(props.player?.person?.fullName ?? '').toLowerCase()
);
</script>

<style scoped>
/* 1959 Topps–inspired: team-color field, white mat, circular photo, angled script name. */
.card {
	backface-visibility: hidden;
	background-color: var(--theme-1959-field, var(--theme-card-top-border, #1a2740));
	border-radius: 10px;
	box-shadow: inset 0 0 0 3px #fff;
	height: 100%;
	left: 0;
	/* overflow:visible — hidden breaks <img> paint inside preserve-3d (tilt/flip) in WebKit/Blink */
	overflow: visible;
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
			transparent 32%,
			var(--card-sheen-mid) 47%,
			var(--card-sheen-highlight) 50.5%,
			var(--card-sheen-mid) 54%,
			transparent 68%
		),
		radial-gradient(130% 85% at 50% -5%, var(--card-sheen-highlight), transparent 52%);
	border-radius: 10px;
	content: "";
	inset: 0;
	opacity: 0.42;
	pointer-events: none;
	position: absolute;
	z-index: 0;
}

.card--many::after {
	opacity: 0.22;
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
	display: flex;
	flex-direction: column;
	height: 100%;
	isolation: isolate;
	padding: 4% 3% 6%;
	position: relative;
	z-index: 1;
}

.card__1959-name {
	color: var(--theme-1959-name, #fff);
	font-family: var(--font-card);
	font-size: clamp(0.95rem, 3.8vw, 1.15rem);
	font-style: italic;
	font-weight: 700;
	letter-spacing: 0.04em;
	line-height: 1.15;
	margin: 0 0 0.35rem;
	padding: 0 2%;
	text-align: center;
	text-shadow:
		0 1px 0 rgba(0, 0, 0, 0.45),
		0 2px 6px rgba(0, 0, 0, 0.25);
	text-transform: lowercase;
	transform: rotate(-4deg);
}

/* Diameter = full inner width of the card (padding is on .card__1959-frame). */
.card__1959-porthole {
	aspect-ratio: 1;
	flex: 0 0 auto;
	margin: 0;
	max-width: 100%;
	min-height: 0;
	min-width: 0;
	position: relative;
	width: 100%;
}

.card--many .card__1959-porthole {
	margin-inline: auto;
	max-width: 100%;
	width: 92%;
}

/* Photo fills the square; PlayerImage root (.card-porthole) is a circle inside */
.card__1959-photo {
	inset: 0;
	position: absolute;
}

.card__1959-bottom {
	align-items: flex-end;
	display: flex;
	flex: 0 0 auto;
	gap: 0.35rem;
	justify-content: space-between;
	margin-top: 0.25rem;
	min-height: 1.75rem;
	padding: 0;
	position: relative;
}

.card__1959-caption {
	display: flex;
	flex: 1;
	flex-direction: column;
	gap: 0.1rem;
	line-height: 1.1;
	padding-bottom: 2px;
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
	background-color: rgba(255, 255, 255, 0.92);
	box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
	position: relative;
	bottom: auto;
	left: auto;
	right: auto;
	flex-shrink: 0;
}
</style>

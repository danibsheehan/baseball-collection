<template>
	<span class="card__logo" :class="theme"></span>
</template>

<script>
export default {
	name: 'PlayerLogo',
	props: {
		theme: {
			type: String
		}
	}
}
</script>

<style scoped>
.card__logo {
	background-image: url('..//assets/mlb-logos-1.0.svg');
	bottom: 0;
	position: absolute;
	height: 0;
	padding-bottom: 30px;
	right: 0;
	width: 30px;
}

.card__logo.ari {
	background-position: 0 0;
}

.card__logo.atl {
	background-position: -30px -30px;
}

.card__logo.bal {
	background-position: -60px -60px;
}

.card__logo.bos {
	background-position: -90px -90px;
}

.card__logo.chw {
	background-position: -150px -150px;
}

.card__logo.chc {
	background-position: -120px -120px;
}

.card__logo.cin {
	background-position: -180px -180px;
}

.card__logo.cle {
	background-position: -210px -210px;
}

.card__logo.col {
	background-position: -240px -240px;
}
.card__logo.det {
	background-position: -270px -270px;
}

.card__logo.hou {
	background-position: -300px -300px;
}

.card__logo.kc {
	background-position: -330px -330px;
}

.card__logo.laa {
	background-position: -360px -360px;
}

.card__logo.lad {
	background-position: -390px -390px;
}

.card__logo.mia {
	background-position: -420px -420px;
}

.card__logo.mil {
	background-position: -450px -450px;
}

.card__logo.min {
	background-position: -480px -480px;
}

.card__logo.nym {
	background-position: -510px -510px;
}

.card__logo.nyy {
	background-position: -540px -540px;
}

.card__logo.oak {
	background-position: -570px -570px;
}

.card__logo.phi {
	background-position: -600px -600px;
}

.card__logo.pit {
	background-position: -630px -630px;
}

.card__logo.sd {
	background-position: -660px -660px;
}

.card__logo.sf {
	background-position: -690px -690px;
}

.card__logo.sea {
	background-position: -720px -720px;
}

.card__logo.stl {
	background-position: -750px -750px;
}

.card__logo.tb {
	background-position: -780px -780px;
}

.card__logo.tex {
	background-position: -810px -810px;
}

.card__logo.tor {
	background-position: -840px -840px;
}

.card__logo.wsh {
	background-position: -870px -870px;
}
</style>

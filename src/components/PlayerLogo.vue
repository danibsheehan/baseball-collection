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
	border: 2px solid black;
	border-radius: 50%;
	bottom: 5px;
	position: absolute;
	height: 0;
	padding-bottom: 30px;
	right: 5px;
	width: 30px;
}

.card__logo.ari {
	background-position: 0 0;
	border-color: rgb(167, 30, 49);
}

.card__logo.atl {
	background-position: -30px -30px;
	border-color: rgb(206, 31, 67);
}

.card__logo.bal {
	background-position: -60px -60px;
	border-color: rgb(221, 73, 38);
}

.card__logo.bos {
	background-position: -90px -90px;
	border-color: rgb(189, 49, 57);
}

.card__logo.chw {
	background-position: -150px -150px;
	border-color: rgb(196, 206, 211);
}

.card__logo.chc {
	background-position: -120px -120px;
	border-color: rgb(204, 52, 51);
}

.card__logo.cin {
	background-position: -180px -180px;
	border-color: rgb(0, 0, 0);
}

.card__logo.cle {
	background-position: -210px -210px;
	border-color: rgb(26, 46, 90);
}

.card__logo.col {
	background-position: -240px -240px;
	border-color: rgb(0, 0, 0);
}

.card__logo.det {
	background-position: -270px -270px;
	border-color: rgb(242, 103, 34);
}

.card__logo.hou {
	background-position: -300px -300px;
	border-color: rgb(30, 49, 96);
}

.card__logo.kc {
	background-position: -330px -330px;
	border-color: rgb(123, 178, 221);
}

.card__logo.laa {
	background-position: -360px -360px;
	border-color: rgb(0, 50, 99);
}

.card__logo.lad {
	background-position: -390px -390px;
	border-color: rgb(239, 62, 66);
}

.card__logo.mia {
	background-position: -420px -420px;
	border-color: rgb(0, 0, 0);
}

.card__logo.mil {
	background-position: -450px -450px;
	border-color: rgb(181, 146, 47);
}

.card__logo.min {
	background-position: -480px -480px;
	border-color: rgb(207, 172, 122);
}

.card__logo.nym {
	background-position: -510px -510px;
	border-color: rgb(0, 45, 114);
}

.card__logo.nyy {
	background-position: -540px -540px;
	border-color: rgb(196, 206, 211);
}

.card__logo.oak {
	background-position: -570px -570px;
	border-color: rgb(238, 178, 30);
}

.card__logo.phi {
	background-position: -600px -600px;
	border-color: rgb(40, 73, 153);
}

.card__logo.pit {
	background-position: -630px -630px;
	border-color: rgb(0, 0, 0);
}

.card__logo.sd {
	background-position: -660px -660px;
	border-color: rgb(30, 49, 96);
}

.card__logo.sf {
	background-position: -690px -690px;
	border-color: rgb(0, 0, 0);
}

.card__logo.sea {
	background-position: -720px -720px;
	border-color: rgb(2, 93, 93);
}

.card__logo.stl {
	background-position: -750px -750px;
	border-color: rgb(34, 32, 95);
}

.card__logo.tb {
	background-position: -780px -780px;
	border-color: rgb(144, 188, 228);
}

.card__logo.tex {
	background-position: -810px -810px;
	border-color: rgb(35, 57, 116);
}

.card__logo.tor {
	background-position: -840px -840px;
	border-color: rgb(231, 44, 37);
}

.card__logo.wsh {
	background-position: -870px -870px;
	border-color: rgb(33, 39, 89);
}
</style>

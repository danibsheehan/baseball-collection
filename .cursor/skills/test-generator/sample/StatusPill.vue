<script setup lang="ts">
defineProps<{
	label: string;
	active?: boolean;
}>();
</script>

<template>
	<span class="pill" :class="{ active: active }" data-testid="pill">{{ label }}</span>
</template>

<style scoped>
.pill.active {
	font-weight: bold;
}
</style>

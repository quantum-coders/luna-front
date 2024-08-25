<template>
	<loading
		:active="active"
		:is-full-page="isFullPage"
	/>
</template>

<script setup>
	import Loading from 'vue3-loading-overlay';
	import 'vue3-loading-overlay/dist/vue3-loading-overlay.css';

	// receive active via props
	const props = defineProps({
		active: {
			type: Boolean,
			default: false,
		},
		isFullPage: {
			type: Boolean,
			default: false,
		},
	});

</script>

<!--suppress SassScssResolvedByNameOnly -->
<style lang="sass">
	.vld-overlay
		position: absolute
		top: 0
		left: 0
		width: 100%
		height: 100%

		.vld-background
			background-color: rgba(var(--bs-body-bg-rgb), 1)
			opacity: 0.75

		.vld-icon > svg
			stroke: var(--bs-primary)

</style>
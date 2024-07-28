<template>
	<div :style="styles" class="section-wrapper">
		<img class="background" src="/images/background.jpg" alt="">

		<layout-header />

		<div class="page-wrapper">
			<layout-sidebar />
			<nuxt-page />
		</div>
	</div>
</template>

<script setup>
	const styles = { '--inner-wrapper-width': '1000px' };
</script>

<!--suppress SassScssResolvedByNameOnly -->
<style lang="sass" scoped>
	.section-wrapper
		display: flex
		flex-grow: 1
		flex-direction: column

		.background
			position: fixed
			top: 0
			left: 0
			width: 100%
			height: 100%
			object-fit: cover
			z-index: 0
			opacity: 0.025

			[data-bs-theme="light"] &
				filter: invert(1)

	.page-wrapper
		display: flex
		flex-grow: 1
</style>
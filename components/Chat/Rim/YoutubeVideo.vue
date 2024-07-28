<template>
	<!-- youtube video -->
	<div class="ratio ratio-16x9">
		<iframe
			:src="`https://www.youtube.com/embed/${ rim.parameters.id }`"
			:title="rim.parameters.title"
			frameborder="0"
			allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
			allowfullscreen
		/>
	</div>
</template>

<script setup>

	const props = defineProps({
		rim: {
			type: Object,
			required: true,
		},
	});

</script>

<!--suppress SassScssResolvedByNameOnly -->
<style lang="sass" scoped>
</style>
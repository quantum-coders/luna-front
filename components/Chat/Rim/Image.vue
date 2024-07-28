<template>
		<img alt="" :src="rim.parameters.imageUrl">
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
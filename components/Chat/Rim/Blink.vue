<template>
	<div class="p-3">
		<solana-blink :blink-url="rim.parameters.blinkUrl" :mode="mode" :parameters="rim.parameters.blinkParameters" />
	</div>
</template>

<script setup>

	const props = defineProps({
		rim: {
			type: Object,
			required: true,
		},
		mode: {
			type: String,
			default: 'compact',
		},
	});

</script>

<!--suppress SassScssResolvedByNameOnly -->
<style lang="sass" scoped>
</style>
<template>
	<div class="input-wrapper">
		<label class="color" :style="{ backgroundColor: color }">
			<input type="color" v-model="color" />
		</label>
		<input type="text" v-model="color" />
	</div>
</template>

<script setup>
	const emit = defineEmits([ 'update:modelValue' ]);

	const props = defineProps({
		modelValue: {
			type: String,
			default: '',
		},
	});

	// computed selectedCustomer with get and set
	const color = computed({
		get: () => props.modelValue,
		set: (value) => {
			emit('update:modelValue', value);
		},
	});

</script>

<!--suppress SassScssResolvedByNameOnly -->
<style lang="sass" scoped>

	.input-wrapper
		display: flex
		align-items: stretch
		border-radius: var(--bs-border-radius)
		border: var(--bs-border-width) solid var(--bs-border-color)
		background-color: var(--bs-body-bg)
		transition: all 500ms ease

		label
			margin: 0
			display: flex
			width: 3rem
			align-items: flex-end
			justify-content: flex-start
			border-radius: var(--bs-border-radius) 0 0 var(--bs-border-radius)
			border-right: var(--bs-border-width) solid var(--bs-border-color)
			transition: all 500ms ease

			input[type="color"]
				-webkit-appearance: none
				width: 0
				height: 0
				border: 0
				opacity: 0
				border-radius: var(--bs-border-radius)
				padding: 0
				cursor: pointer

		input[type="text"]
			border: 0
			flex-grow: 1
			background: 0
			padding: 0.375rem 0.75rem
			outline: 0

		// has something focused
		&:has(:focus-within)
			color: var(--bs-body-color)
			background-color: var(--bs-body-bg)
			border-color: $primary
			outline: 0
			box-shadow: 0 0 0 0.25rem rgba(105, 248, 155, 0.25)

			label
				border-color: $primary

</style>
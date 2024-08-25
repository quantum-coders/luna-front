<template>
	<div class="selector-wrapper">
		<p>Select your poison</p>

		<div class="blink-types mb-3">
			<div class="c-row">
				<template v-for="(type, t) in blinkEditor.types">
					<div class="col-12 col-sm-6 col-md-4 flex-column d-flex">
						<article
							class="blink-type"
							@click="blinkEditor.selectedType = t"
							:class="{ 'is-selected': blinkEditor.selectedType === t }"
						>
							<h4>{{ type.name }}</h4>
							<p>{{ type.description }}</p>
						</article>
					</div>
				</template>
			</div>
		</div>
	</div>
</template>

<script setup>
	const blinkEditor = useBlinkEditor();

</script>

<!--suppress SassScssResolvedByNameOnly -->
<style lang="sass" scoped>

	.selector-wrapper
		padding: 1rem

	.blink-type
		flex-grow: 1
		border: 1px solid var(--bs-border-color)
		border-radius: 0.5rem
		padding: 3rem
		cursor: pointer

		&.is-selected,
		&:hover
			border-color: var(--bs-primary)

		h4
			font-size: 0.75rem
			color: var(--bs-primary)
			text-transform: uppercase
			letter-spacing: 0.1rem
			margin-bottom: 0

		p
			margin-bottom: 0
</style>
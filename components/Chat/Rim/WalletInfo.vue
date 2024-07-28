<template>
	<div class="balance">
		<template v-for="b in rim.parameters.balances">
			<article class="coin">
				<div class="coin-info d-flex align-items-start gap-2">
					<img class="logo" :src="b.logoURI" alt="">

					<span class="d-flex flex-column gap-2">
						<span class="name">{{ b.name }}</span>
						<span class="amount font-monospace">{{ b.balance }}</span>
					</span>
				</div>
			</article>
		</template>
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

	.balance
		padding: 1rem

		.coin
			display: flex
			align-items: center
			justify-content: space-between
			padding: 0.5rem
			border-bottom: 1px solid var(--bs-border-color)

			.coin-info
				.name
					line-height: 1

				.logo
					width: 30px
					aspect-ratio: 1
					border-radius: 10rem

				.amount
					font-size: 1.5rem
					line-height: 1

</style>
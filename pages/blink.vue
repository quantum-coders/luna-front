<template>
	<div class="blink-wrapper d-flex flex-column flex-grow-1">
		<header class="blink-header d-flex align-items-center">

			<div class="logo-wrapper">
				<svgo-luna-logo class="logo" />
			</div>

			<div class="header-tools d-flex ms-auto align-items-center justify-content-end gap-2">
				<platform-theme-switcher />
				<solana-wallet-connect />
			</div>

		</header>
		<div class="the-blink">
			<solana-blink :blink-url="b" />
		</div>
	</div>
</template>

<script setup>

	// get the b parameter from the query string
	const { query } = useRoute();
	const b = query.b;

</script>

<!--suppress SassScssResolvedByNameOnly -->
<style lang="sass" scoped>
	.blink-header
		padding: 1rem
		position: fixed
		top: 0
		left: 0
		width: 100%
		z-index: 1000

		.logo-wrapper
			display: flex
			align-items: center
			gap: 1rem
			padding-left: 1rem

			@media (min-width: $sm)
				padding-left: 0

			.header-icon
				background: var(--bs-light-bg-subtle)
				width: 60px
				height: 59px
				justify-content: center
				align-items: center
				font-size: 1.5rem
				display: none

				@media (min-width: $sm)
					display: flex

			.logo
				width: auto
				height: 40px

		.header-tools
			width: 200px

			padding-right: 1rem

	.the-blink
		display: flex
		justify-content: center
		align-items: center
		flex-grow: 1
		z-index: 1
</style>
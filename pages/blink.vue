<template>
	<div class="blink-wrapper d-flex flex-column flex-grow-1" :style="cssVars" :class="{ 'embed': !!embed }">
		<header class="blink-header d-flex align-items-center" v-if="!embed">
			<div class="logo-wrapper">
				<template v-if="blink && blink.logo">
					<img :src="blink.logo" alt="Logo" class="header-custom-logo" />
				</template>
				<svgo-luna-logo v-else class="logo" />
			</div>

			<div class="header-tools d-flex ms-auto align-items-center justify-content-end gap-2">
				<platform-theme-switcher />

				<solana-wallet-connect v-if="!useDevice().isMobile" />

				<div v-else class="mobile-connect d-block d-sm-none">
					<a
						href="#"
						v-if="!solanaStore.wallet"
						class="btn btn-sm btn-primary rounded-pill"
						@click.prevent="solanaStore.mobileConnect"
					>Connect Wallet</a>
					<a href="#" v-else class="btn btn-sm btn-primary rounded-pill">
						<!-- show wallet address with ellipsis -->
						{{ solanaStore.wallet.slice(0, 4) }}...{{ solanaStore.wallet.slice(-4) }}
					</a>
				</div>
			</div>
		</header>

		<div class="the-blink" v-if="blink">
			<div v-if="!!embed && !solanaStore.wallet" class="connect-embed">
				<solana-wallet-connect />
			</div>

			<solana-emoji-rain
				class="emoji-rain"
				:emojis="['⭐', '✨', '🌟', '🌙']"
				:speed="10"
				:density="50"
				:spawn="success"
			/>
			<solana-blink
				:blink-object="blink"
				:blink-url="b"
				:primaryColor="blink.primaryColor"
				@transaction-successful="transactionSuccessful"
			/>
		</div>
	</div>
</template>

<script setup>

	// get the b parameter from the query string
	const { query } = useRoute();
	const b = query.b;
	const blink = ref(null);

	const solanaStore = useSolanaStore();

	// check if the param embed is set to 1
	const embed = query.embed === '1';

	if(!!query.mode) {
		document.documentElement.setAttribute('data-bs-theme', query.mode);
	}


	const success = ref(false);

	const fetchBlink = async () => {
		const res = await useFetch(b);
		blink.value = res.data.value;
	};

	const cssVars = computed(() => {

		if(!blink.value) return {};

		const vars = {};

		if(blink.value.primaryColor) {
			vars['--bs-btn-bg'] = blink.value.primaryColor;
		}

		if(blink.value.background) {
			vars['--blink-background'] = blink.value.background;
			vars['--blink-header-background'] = 'var(--bs-body-bg-rgb)';
		}

		return vars;
	});

	const transactionSuccessful = () => {
		success.value = true;

		// wait 5 seconds and then reset the success state
		setTimeout(() => {
			success.value = false;
		}, 5000);
	};

	onMounted(() => {
		fetchBlink();
	});

</script>

<!--suppress SassScssResolvedByNameOnly -->
<style lang="sass" scoped>

	.connect-embed
		position: absolute
		right: 0
		top: 0

	.emoji-rain
		z-index: 0
		pointer-events: none
		background: transparent

	&:has(.embed)
		.blink-wrapper
			background: transparent !important

	.blink-wrapper
		background: var(--blink-background, var(--bs-body-bg-rgb))
		justify-content: center

	.blink-header
		padding: 0.5rem 1rem
		position: fixed
		top: 0
		left: 0
		width: 100%
		z-index: 1000
		background: rgba(var(--blink-header-background, transparent), 0.75)

		@media (min-width: $sm)
			padding: 0.5rem 1rem

		.logo-wrapper
			display: flex
			align-items: center
			gap: 1rem

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

			.header-custom-logo
				width: auto
				height: 30px
				margin: 5px

		.header-tools
			min-width: 200px

	.the-blink
		display: flex
		justify-content: center
		align-items: center
		flex-grow: 1
		z-index: 1
		padding: 1rem

		@media (min-width: $sm)
			padding: 0

	&:has(.embed)
		.the-blink
			flex-direction: column
			display: flex
			justify-content: stretch
			align-items: stretch

			.blink-card-wrapper
				flex-grow: 1
				display: flex
				background: var(--bs-body-bg)

				:deep(.blink-card)
					justify-content: center
					flex-grow: 1
					border: 0

</style>

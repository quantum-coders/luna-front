<template>
	<div class="rim-experience">
			<main class="connect" v-if="!solana.wallet">

				<div class="connect-card">
					<img src="/images/lunita.png" alt="">
					<div class="copy p-3">
						<h2>Connect Your Wallet to Unlock Luna AI's Full Potential</h2>
						<p>Discover the future of AI-driven solutions with Luna AI! By connecting your wallet, you gain access to a revolutionary platform that harnesses the power of artificial intelligence to elevate your business strategies and operations</p>
						<p class="text-end mb-0">
							<a href="#" class="btn btn-primary" @click.prevent="connectWallet">
								<icon name="material-symbols:account-balance-wallet-outline" />
								Connect Wallet
							</a>
						</p>
					</div>
				</div>

			</main>
			<main v-else class="chat">
				<!--<a href="#" class="btn btn-primary" @click.prevent="toggle">Toggle Sidebar</a>-->
				<chat-thread />
				<div class="chat-controls">
					<chat-input />
				</div>
			</main>

			<aside :class="{ 'is-open': !!chat.wisMessage && solana.wallet }" class="wis">
				<chat-wis />
			</aside>
		</div>
</template>

<script setup>
	definePageMeta({ layout: 'luna' });

	const solana = useSolanaStore();

	const styles = {
		'--inner-wrapper-width': '1000px',
	};

	const chat = useChatStore();

	const connectWallet = () => {
		// click .swv-button-trigger
		document.querySelector('.swv-button-trigger').click();
	};

</script>

<!--suppress SassScssResolvedByNameOnly -->
<style lang="sass" scoped>
	.rim-experience
		container-type: size
		display: flex
		flex-grow: 1

		@container (max-width: 1300px)
			.wis
				position: fixed
				left: auto
				right: -90dvw
				width: 90dvw
				height: calc(100dvh - 60px)
				background: var(--bs-light-bg-subtle)

				[data-bs-theme="dark"] &
					background: var(--bs-dark-bg-subtle)

				&.is-open
					width: 90dvw
					right: 0

					.scroll-wrapper
						min-width: 90dvw

	.connect
		flex-grow: 1
		display: flex
		justify-content: center
		align-items: center

		.connect-card
			overflow: hidden
			max-width: 800px
			width: 80%
			box-shadow: 0 0 20px rgba(0, 0, 0, 0.25)
			border-radius: 1rem
			display: flex
			align-items: center
			flex-direction: column

			@media (min-width: $md)
				flex-direction: row

			img
				width: 100%
				max-height: 250px
				object-fit: contain
				background: black

				@media (min-width: $md)
					width: 300px

			h2
				font-size: 1.5rem
				margin-bottom: 1rem
				color: $primary

	.chat
		flex-grow: 1
		display: flex
		flex-direction: column
		z-index: 1

		.chat-controls
			padding: 0 1rem 1rem

	.wis
		border-left: 1px solid var(--bs-border-color)
		transition: all 500ms ease-in-out
		position: fixed
		width: 90vw
		height: calc(100dvh - 60px)
		right: -100vw
		z-index: 100

		.scroll-wrapper
			min-width: 90vw

		@media (min-width: $sm)
			width: 60px
			position: relative
			right: auto
			height: auto

		&.is-open
			background: var(--bs-light-bg-subtle)
			right: 0

			[data-bs-theme="dark"] &
				background: var(--bs-dark-bg-subtle)

			@media (min-width: $sm)
				width: 600px
				right: auto

				.scroll-wrapper
					min-width: 600px
</style>
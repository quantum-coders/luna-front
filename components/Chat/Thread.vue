<template>
	<div class="thread-area d-flex flex-column flex-grow-1">
		<div class="scroll-wrapper pretty-scrolls" id="thread" v-if="!!chat.messages.length">
			<div class="thread-wrapper">
				<template v-for="m in chat.messages">
					<chat-rim class="mb-3" :class="`is-${ m.role }`" :message="m" />
				</template>
			</div>
		</div>

		<div v-else class="d-flex flex-column flex-grow-1 justify-content-end">
			<div class="examples">

				<h4 class="text-center mb-3">Try Luna now</h4>

				<div class="examples-wrapper">
					<div class="row gy-3">
						<div class="col d-flex col-12 col-sm-4">
							<div class="example flex-grow-1" @click.prevent="addMessage('Give me my solana wallet balance')">
								<p>
									<icon name="material-symbols:account-balance-wallet-outline-rounded" />
								</p>
								<p>Give me my solana wallet balance</p>
							</div>
						</div>

						<div class="col d-flex col-12 col-sm-4">
							<div class="example flex-grow-1" @click.prevent="addMessage('Find a video about Solana Actions')">
								<p>
									<icon name="lucide:youtube" />
								</p>
								<p>Find a video about Solana Blink Actions</p>
							</div>
						</div>

						<div class="col d-flex col-12 col-sm-4">
							<div class="example flex-grow-1" @click.prevent="addMessage('Transfer Sol to a user')">
								<p>
									<icon name="solar:transfer-horizontal-line-duotone" />
								</p>
								<p>Transfer Sol to a user</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
	const chat = useChatStore();

	const addMessage = async (message) => {
		if(message) {
			chat.addMessage({
				role: 'user',
				text: message,
			});

			await chat.sendMessage(message);
			await nextTick();
			chat.scrollToBottom();
		}
	};
</script>

<!--suppress SassScssResolvedByNameOnly -->
<style lang="sass" scoped>
	.thread-area
		flex-grow: 1
		padding: 0.5rem

		@media (min-width: $sm)
			padding: 1rem

		.thread-wrapper
			min-height: 100px
			max-width: 1000px
			margin: 0 auto
			padding: 0.5rem

			@media (min-width: $sm)
				padding: 1rem

	.examples
		.examples-wrapper
			max-width: 80%
			margin: 0 auto

			@media (min-width: $sm)
				max-width: var(--inner-wrapper-width)

		.example
			border: 1px solid var(--bs-border-color)
			border-radius: 0.5rem
			padding: 2rem
			cursor: pointer

			&:hover
				background: var(--bs-dark-bg-subtle)

			.icon
				font-size: 2rem
				color: $primary
</style>
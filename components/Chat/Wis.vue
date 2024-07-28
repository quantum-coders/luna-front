<template>
	<div class="scroll-wrapper p-3">
		<p class="text-end">
			<a
				href="#"
				class="close"
				@click.prevent="chat.closeWis"
				:class="{ 'is-hidden': !chat.wisMessage || !solana.wallet }"
			>
				<icon name="material-symbols:right-panel-close-rounded" />
			</a>
		</p>
		<template v-if="chat.wisMessage && !!chat.wisMessage.rims.length && solana.wallet">

			<template v-if="rim.rimType === 'image'">
				<chat-rim-image :rim="rim" />
			</template>

			<template v-if="rim.rimType === 'video'">
				<chat-rim-youtube-video :rim="rim" class="mb-3" />
				<h5 class="mb-0">{{ rim.parameters.title }}</h5>
				<p>by <a
					class="text-body"
					target="_blank"
					:href="`https://youtube.com/channel/${ rim.parameters.channelId }`"
				>{{ rim.parameters.author }}</a></p>

				<p>{{ rim.parameters.description }}</p>
			</template>

			<template v-if="rim.rimType === 'wallet'">
				<chat-rim-wallet-info :rim="rim" />
			</template>

			<template v-if="rim.rimType === 'blink'">
				<chat-rim-blink mode="card" :rim="rim" />
			</template>
		</template>
	</div>
</template>

<script setup>

	const chat = useChatStore();
	const solana = useSolanaStore();

	// compute rim
	const rim = computed(() => {

		if(!chat.wisMessage || !chat.wisMessage.rims.length || !solana.wallet)
			return null;
		return chat.wisMessage.rims[0];
	});

</script>

<!--suppress SassScssResolvedByNameOnly -->
<style lang="sass" scoped>

	img
		max-width: 100%

	.scroll-wrapper
		overflow-x: clip

	.close
		opacity: 1
		transition: opacity 0.3s

		&.is-hidden
			opacity: 0
			pointer-events: none

</style>
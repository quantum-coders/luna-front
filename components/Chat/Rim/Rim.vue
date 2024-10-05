<template>
	<div class="rim-wrapper">
		<div class="avatar">
			<icon v-if="message.role === 'assistant'" name="material-symbols:dark-mode-outline-rounded"/>
			<icon v-if="message.role === 'user'" name="bx:happy-alt"/>
		</div>
		<div class="rim">
			<!-- bootstrap loading spinner -->
			<div class="rim-loading" v-if="!!message.loading">
				<div class="spinner-border text-primary" role="status">
					<span class="visually-hidden">Loading...</span>
				</div>
			</div>

			<div class="rim-audio" v-if="message.role === 'assistant' && !message.loading">
				<a
					v-if="!audio?.url && !message?.audioGenerateLoading"
					@click="generateAudio(message)"
					class="generate-audio-wrapper text-primary generate-audio-icon d-flex align-items-center justify-content-start"
					title="Generate Audio"
					role="button"
					style="cursor: pointer;"
				>
					<icon name="bi:file-earmark-music-fill"/>
				</a>
				<chat-audio-player v-else :audio-url="audio?.url || ''" :loading="message.audioGenerateLoading"/>
			</div>

			<div class="rim-rich-content" v-if="message.rims">
				<template v-for="r in message.rims">
					<div class="rim-image" v-if="r.rimType === 'image'">
						<chat-rim-image :rim="r"/>
					</div>

					<div class="rim-youtube-video" v-else-if="r.rimType === 'video'">
						<chat-rim-youtube-video :rim="r"/>
					</div>

					<div class="rim-rich-wrapper" v-else-if="r.rimType === 'wallet'">
						<chat-rim-wallet-info :rim="r"/>
					</div>

					<div class="rim-rich-wrapper" v-else-if="r.rimType === 'blink'">
						<chat-rim-blink :rim="r"/>
					</div>

					<div v-else>
						<pre>{{ r }}</pre>
					</div>
				</template>
			</div>
			<div class="rim-textual-content">
				<div v-html="html"/>
			</div>
			<div class="rim-actions">
				<div class="actions">
					<a
						class="action"
						href="#"
						@click.prevent="chat.openWis(message.uid)"
						v-if="message.role === 'assistant' && typeof message.rims !== 'undefined' && message.rims.length"
					>
						<icon name="material-symbols:right-panel-close-rounded"/>
					</a>
				</div>

				<span class="timestamp">{{ formattedTime }}</span>
			</div>
		</div>
	</div>
</template>

<script setup>
	import {marked} from 'marked';
	import {useDateFormat} from '@vueuse/core';

	const chat = useChatStore();

	const props = defineProps({
		message: {
			type: Object,
			required: true,
		},
	});

	const generateAudio = async (message) => {
		try {
			message.audioGenerateLoading = true;
			await chat.generateAudio(message);
		} catch (e) {
			console.error(e);
		} finally {
			message.audioGenerateLoading = false;
		}
	};

	// compute the html from the markdown
	const html = computed(() => marked.parse(props.message.text));

	// parse timestamp to get the time
	const formattedTime = computed(() => {
		const date = new Date(props.message.timestamp);
		const now = new Date();

		// Use useDateFormat to give it a friendly and nice format
		if (date.toDateString() === now.toDateString()) {
			return useDateFormat(date, 'HH:mm').value; // "Today at 14:35"
		} else if (
			date.toDateString() === new Date(now.setDate(now.getDate() - 1)).toDateString()
		) {
			return `Yesterday at ${useDateFormat(date, 'HH:mm').value}`;
		} else {
			return useDateFormat(date, 'MMMM DD, YYYY').value; // "October 3, 2023"
		}
	});

	/// create a compued propertie to search on the key variants, the one with type audio
	const audio = computed(() => {
		return props.message?.variants.find(r => r.type === 'audio');
	});

</script>

<!--suppress SassScssResolvedByNameOnly -->
<style lang="sass" scoped>
	.generate-audio-wrapper
		cursor: pointer

	.ratio > *
		position: absolute

	.rim-image
		img
			width: 400px

	.rim-wrapper
		display: flex
		gap: 0.5rem
		align-items: flex-start

		@media (min-width: $sm)
			gap: 1rem

		&.is-assistant
			justify-content: flex-start

			.rim
				border-top-left-radius: 0

		&.is-user
			flex-direction: row-reverse

			.rim
				border-top-right-radius: 0

		.avatar
			width: 45px
			aspect-ratio: 1
			background: var(--bs-dark-bg-subtle)
			border-radius: 50%
			display: flex
			justify-content: center
			align-items: center

			.icon
				display: block

		.rim
			border: 1px solid var(--bs-border-color)
			background: var(--bs-body-bg)
			border-radius: 0.5rem
			width: fit-content
			max-width: 90%
			min-width: 100px
			overflow: hidden

			@media (min-width: $sm)
				max-width: 75%

			&:has(.rim-image)
				min-width: 200px
				width: min-content
				max-width: 80%

			.rim-loading
				padding: 1rem
				display: flex
				justify-content: center

			.rim-audio
				padding: 0.5rem
				display: flex
				flex-direction: column
				justify-content: center
				border-bottom: 1px solid var(--bs-border-color)

				audio
					width: 100%
					height: 30px

			.rim-textual-content
				padding: 0.5rem 1rem

				&:has(div:empty)
					display: none

				& > div *:last-child
					margin-bottom: 0

			.rim-actions
				padding: 0.2rem 0.5rem
				display: flex
				border-top: 1px solid var(--bs-border-color)

				.actions
					display: flex
					align-items: center

					.action
						display: flex
						align-items: center
						justify-content: center

				.timestamp
					margin-left: auto
					font-size: 0.8rem
					color: var(--bs-text-muted)

</style>

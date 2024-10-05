<template>
	<div class="audio-wrapper d-flex align-items-center gap-2" :class="{ 'is-loading': !!loading && !audioUrl }">
		<div class="play-pause">
			<template v-if="!!loading && !audioUrl">
				<icon name="line-md:loading-twotone-loop"/>
			</template>
			<template v-else>
				<a @click.prevent="playAudio" href="#" class="play-button" v-if="!isPlaying">
					<icon name="bi:play-fill"/>
				</a>
				<a @click.prevent="pauseAudio" href="#" class="pause-button" v-else>
					<icon name="bi:pause-fill"/>
				</a>
			</template>
		</div>
		<div class="progress-wrapper" @mousedown="startSeek">
			<div class="progress">
				<div class="progress-bar" :style="`width: ${ percentage }`"></div>
			</div>
		</div>

		<div class="time">
			{{ duration }} /
			{{ totalTime }}
		</div>
	</div>
	<audio controls ref="audio" v-if="audioUrl">
		<source :src="audioUrl" type="audio/mpeg">
		Your browser does not support the audio element.
	</audio>
</template>

<script setup>
	import {onMounted, watch, ref, defineProps, nextTick} from 'vue';

	const audio = ref(null);
	const isPlaying = ref(false);

	const duration = ref('0:00');
	const totalTime = ref('0:00');
	const percentage = ref(0);

	const playAudio = () => {
		console.log('Attempting to play audio');
		if (audio.value) {
			audio.value.play();
			console.log('Audio is playing');
		} else {
			console.warn('Audio element is not available');
		}
	};

	const pauseAudio = () => {
		console.log('Attempting to pause audio');
		if (audio.value) {
			audio.value.pause();
			console.log('Audio is paused');
		} else {
			console.warn('Audio element is not available');
		}
	};

	const props = defineProps({
		audioUrl: {
			type: String,
			required: true,
		},
		loading: {
			type: Boolean,
			default: false,
		},
	});

	const startSeek = (event) => {
		console.log('Start seek', event);
		document.addEventListener('mousemove', dragSeek);
		document.addEventListener('mouseup', stopSeek);
		seek(event);
	};

	const dragSeek = (event) => {
		seek(event);
	};

	const stopSeek = (event) => {
		console.log('Stop seek', event);
		document.removeEventListener('mousemove', dragSeek);
		document.removeEventListener('mouseup', stopSeek);
		seek(event);
	};

	const seek = (event) => {
		const progressWrapper = document.querySelector('.progress-wrapper');
		if (!progressWrapper) {
			console.warn('Progress wrapper not found');
			return;
		}
		const {clientX} = event;
		const {left, width} = progressWrapper.getBoundingClientRect();
		const percentageValue = (clientX - left) / width;
		const newTime = audio.value.duration * percentageValue;
		console.log('Seeking to new time:', newTime);
		if (audio.value) {
			audio.value.currentTime = newTime;
			percentage.value = `${(newTime / audio.value.duration) * 100}%`;
			console.log('New current time set:', audio.value.currentTime);
		} else {
			console.warn('Audio element is not available during seek');
		}
	};

	const bindEvents = () => {
		if (!audio.value) {
			console.warn('Cannot bind events, audio element not available');
			return;
		}
		console.log('Binding audio events');
		audio.value.addEventListener('loadedmetadata', () => {
			console.log('Metadata loaded, duration:', audio.value.duration);
			const minutes = Math.floor(audio.value.duration / 60);
			const seconds = Math.floor(audio.value.duration % 60);
			totalTime.value = `${minutes}:${seconds.toString().padStart(2, '0')}`;
			console.log('Total time set:', totalTime.value);
		});

		audio.value.addEventListener('timeupdate', () => {
			const progress = (audio.value.currentTime / audio.value.duration) * 100;
			percentage.value = `${progress}%`;

			const minutes = Math.floor(audio.value.currentTime / 60);
			const seconds = Math.floor(audio.value.currentTime % 60);
			duration.value = `${minutes}:${seconds.toString().padStart(2, '0')}`;
			console.log('Time updated:', duration.value, 'Progress:', percentage.value);
		});

		audio.value.addEventListener('ended', () => {
			console.log('Audio ended');
			isPlaying.value = false;
		});

		audio.value.addEventListener('pause', () => {
			console.log('Audio paused');
			isPlaying.value = false;
		});

		audio.value.addEventListener('play', () => {
			console.log('Audio playing');
			isPlaying.value = true;
		});
	};

	watch(() => props.audioUrl, async (newUrl) => {
		console.log('Audio URL changed:', newUrl);
		if (audio.value) {
			console.log('Audio element available after URL change');
			audio.value.src = newUrl; // Update audio source
			await nextTick();
			audio.value.load(); // Reload the audio element
			audio.value.addEventListener('loadedmetadata', () => {
				console.log('Metadata loaded after URL change, duration:', audio.value.duration);
				const minutes = Math.floor(audio.value.duration / 60);
				const seconds = Math.floor(audio.value.duration % 60);
				totalTime.value = `${minutes}:${seconds.toString().padStart(2, '0')}`;
				console.log('Total time updated after URL change:', totalTime.value);
			});
			bindEvents();
		} else {
			console.warn('Audio element not available after URL change');
		}
	});

	onMounted(async () => {
		console.log('Component mounted');
		await nextTick();
		if (audio.value && props.audioUrl) {
			console.log('Audio element available, binding events');
			bindEvents();
		} else {
			console.warn('Audio element or audioUrl not available on mount');
		}
	});
</script>

<style lang="sass" scoped>
	.audio-wrapper
		&.is-loading
			pointer-events: none

	audio
		display: none

	.play-pause
		display: flex
		align-items: center
		justify-content: center

		a
			display: flex
			align-items: center
			justify-content: center

	.progress-wrapper
		display: flex
		align-items: center
		justify-content: center
		flex-grow: 1
		padding: 0.5rem 0
		cursor: pointer

		.progress
			width: 100%
			height: 5px

			.progress-bar
				transition: none
				pointer-events: none

	.time
		font-size: 0.75rem
		// disable selection
		user-select: none
</style>

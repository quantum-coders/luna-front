<template>
	<div class="audio-wrapper d-flex align-items-center gap-2" :class="{ 'is-loading': !!loading && !audioUrl }">
		<div class="play-pause">
			<template v-if="!!loading && !audioUrl">
				<icon name="line-md:loading-twotone-loop" />
			</template>
			<template v-else>
				<a @click.prevent="playAudio" href="#" class="play-button" v-if="!isPlaying">
					<icon name="bi:play-fill" />
				</a>
				<a @click.prevent="pauseAudio" href="#" class="pause-button" v-else>
					<icon name="bi:pause-fill" />
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
	const audio = ref(null);
	const isPlaying = ref(false);

	const duration = ref('0:00');
	const totalTime = ref('0:00');
	const percentage = ref(0);

	const playAudio = () => {
		audio.value.play();
	};

	const pauseAudio = () => {
		audio.value.pause();
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
		document.addEventListener('mousemove', dragSeek);
		document.addEventListener('mouseup', stopSeek);
		seek(event);
	};

	const dragSeek = (event) => {
		seek(event);
	};

	const stopSeek = (event) => {
		document.removeEventListener('mousemove', dragSeek);
		document.removeEventListener('mouseup', stopSeek);
		seek(event);
	};

	const seek = (event) => {
		const progressWrapper = document.querySelector('.progress-wrapper');
		const { clientX } = event;
		const { left, width } = progressWrapper.getBoundingClientRect();
		const percentageValue = (clientX - left) / width;
		const newTime = audio.value.duration * percentageValue;
		audio.value.currentTime = newTime;
		percentage.value = `${ (newTime / audio.value.duration) * 100 }%`;
	};

	const bindEvents = () => {
		audio.value.addEventListener('loadedmetadata', () => {
			const minutes = Math.floor(audio.value.duration / 60);
			const seconds = Math.floor(audio.value.duration % 60);
			totalTime.value = `${ minutes }:${ seconds.toString().padStart(2, '0') }`;
		});

		audio.value.addEventListener('timeupdate', () => {
			const progress = (audio.value.currentTime / audio.value.duration) * 100;
			percentage.value = `${ progress }%`;

			const minutes = Math.floor(audio.value.currentTime / 60);
			const seconds = Math.floor(audio.value.currentTime % 60);
			duration.value = `${ minutes }:${ seconds.toString().padStart(2, '0') }`;
		});

		audio.value.addEventListener('ended', () => {
			isPlaying.value = false;
		});

		audio.value.addEventListener('pause', () => {
			isPlaying.value = false;
		});

		audio.value.addEventListener('play', () => {
			isPlaying.value = true;
		});
	};

	watch(() => props.audioUrl, () => {
		setTimeout(() => {
			bindEvents();
		}, 500);
	});

	onMounted(() => {
		if(audio.value && props.audioUrl) {
			bindEvents();
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

<template>
	<label class="upload-file">
		<platform-loading class="loading" :active="isLoading" />

		<input
			:id="props.id"
			ref="inputRef"
			type="file"
			class="file-input"
			v-bind="$attrs"
			@change="onChange"
		/>

		<span v-if="label">
			<slot name="label">{{ label }}</slot>
		</span>

		<span
			class="drop-zone"
			@dragenter.prevent="droppable = true"
		>
			<slot v-bind="{ files: localFiles, droppable }">
				<span v-if="localFiles.length" aria-hidden="true">
					<template v-if="localFiles.length > 1">
						{{ localFiles.length }} files selected
					</template>
					<template v-else>
						{{ localFiles[0].name }}
					</template>
				</span>

				<span v-else aria-hidden="true" class="text-center">Choose files or drop here</span>
			</slot>

			<span
				v-if="droppable"
				class="file-overlay"
				@drop.prevent="onDrop"
				@dragenter.stop="dragEnter"
				@dragleave.stop="dragLeave"
				@dragover.prevent
			>
				<slot name="overlay" />
			</span>
		</span>
	</label>
</template>

<script setup>

	const attrs = useAttrs();
	import { v4 as uuidv4 } from 'uuid';

	const localFiles = ref([]);
	const droppable = ref(false);
	const inputRef = ref(null);

	const emit = defineEmits([ 'update', 'update:modelValue', 'fileNotSupported' ]);

	const props = defineProps({
		id: {
			type: String,
			default: uuidv4(),
		},
		modelValue: {
			type: Array,
			default: () => [],
		},
		classes: {
			type: Object,
			default: () => ({
				label: '',
				input: '',
				text: '',
			}),
		},
		label: {
			type: String,
			default: '',
		},
		dropText: {
			type: String,
			default: 'Drop file here',
		},
		isLoading: {
			type: Boolean,
			default: false,
		},
	});

	const onChange = (e) => {
		const files = e.target.files;
		localFiles.value = [ ...localFiles.value, ...files ];
		emit('update', localFiles.value);
		emit('update:modelValue', localFiles.value);
	};

	const onDrop = (e) => {
		let files = e.dataTransfer.files;

		// Validate that files are allowed checking the "accept" attribute
		const accept = attrs.accept;
		if(accept) {

			let allowed = [];
			// Check if accept is a string or an array
			if(typeof accept === 'string') {
				allowed = accept.split(',').map((a) => a.trim());
			} else {
				allowed = accept;
			}

			const allowedFiles = Array.from(files).filter((f) => {
				return allowed.includes(f.type);
			});


			if(allowedFiles.length !== files.length) {
				console.warn('Some files were not allowed');
				emit('fileNotSupported', files);
				files = allowedFiles;
			}
		}

		const isMulti = attrs.multiple || attrs.multiple === '';
		if(!isMulti && files.length > 1) {
			files.length = 1;
		}

		localFiles.value = [ ...localFiles.value, ...files ];
		emit('update', localFiles.value);
		emit('update:modelValue', localFiles.value);

		droppable.value = false;
	};

	const dragEnter = () => {
		droppable.value = true;
	};

	const dragLeave = () => {
		droppable.value = false;
	};

	const dragOver = () => {
	};

	const resetFiles = () => {
		inputRef.value.value = '';
		localFiles.value = [];
	};

	defineExpose({
		resetFiles,
		localFiles,
	});

</script>

<!--suppress SassScssResolvedByNameOnly -->
<style lang="sass" scoped>
	.upload-file
		display: block

		.loading
			position: absolute
			top: 0
			left: 0
			right: 0
			bottom: 0
			z-index: 1

	.drop-zone
		display: flex
		padding: 1rem
		flex-direction: column
		align-items: center
		justify-content: center

	.file-input
		position: absolute
		overflow: hidden
		clip: rect(0 0 0 0)
		width: 1px
		height: 1px
		margin: -1px
		border: 0
		padding: 0

	.file-overlay
		position: absolute
		top: 0
		left: 0
		width: 100%
		height: 100%
		display: flex
		align-items: center
		justify-content: center
		color: white
		transition: all 0.3s ease-in-out

	input:focus ~ .file-dropzone
		outline: -webkit-focus-ring-color auto 1px

</style>

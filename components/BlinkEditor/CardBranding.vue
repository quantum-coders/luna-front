<template>
	<div class="card-branding">
		<h5 class="block-title">Card Branding</h5>

		<!--<pre>{{ blinkEditor.blink }}</pre>-->

		<div class="d-flex align-items-center gap-3 mb-3">
			<div class="icon-upload-wrapper">
				<platform-file-upload
					ref="iconImageRef"
					accept="image/jpeg,image/png"
					@update="uploadIcon"
					class="icon-upload"
					:is-loading="iconLoading"
				>
					<template #default>
						<p v-if="!blinkEditor.customIcon" class="mb-0 text-center">Drop an image here</p>
						<div v-else class="custom-icon">
							<img alt="" :src="blinkEditor.customIcon">
							<a href="#" class="remove" @click="blinkEditor.customIcon = ''">
								<icon name="material-symbols:delete-forever-rounded" />
							</a>
						</div>
					</template>
				</platform-file-upload>
			</div>

			<div class="flex-grow-1">
				<!-- input for title -->
				<div class="form-group mb-3">
					<label for="title" class="form-label">Title</label>
					<input
						type="text"
						id="title"
						class="form-control"
						v-model="blinkEditor.blink.title"
					/>
				</div>

				<!-- description -->
				<div class="form-group">
					<label for="description" class="form-label">Description</label>
					<textarea
						id="description"
						class="form-control"
						v-model="blinkEditor.blink.description"
					></textarea>
				</div>
			</div>
		</div>

		<template v-if="!!blinkEditor.blink.links && !!blinkEditor.blink.links.actions && !!blinkEditor.blink.links.actions.length && !!blinkEditor.blink.links.actions[0].parameters">
			<h5>Actions</h5>
			<div class="form-group mb-3">
				<label for="description" class="form-label">Call to action text</label>
				<input
					type="text"
					id="description"
					class="form-control"
					v-model="blinkEditor.blink.links.actions[0].label"
				/>
			</div>

			<h5>Actions Parameters</h5>

			<div class="row">
				<template v-for="p in blinkEditor.blink.links.actions[0].parameters">
					<div class="col-6">
						<div class="form-group mb-3">
							<div class="d-flex align-items-center justify-content-between">
								<label for="description" class="form-label">
									Placeholder for
									<code>{{ p.name }}</code>
								</label>

								<div class="labels d-flex gap-3">
									<platform-toggle-switch
										class="d-flex align-items-center gap-2"
										v-model="prePostLabels[`pre_${ p.name }`]"
									>
										<template #preSwitch>Pre Label</template>
									</platform-toggle-switch>
									<platform-toggle-switch
										class="d-flex align-items-center gap-2"
										v-model="prePostLabels[`post_${ p.name }`]"
									>
										<template #preSwitch>Post Label</template>
									</platform-toggle-switch>
								</div>
							</div>
							<div class="input-group">
								<input
									v-if="prePostLabels[`pre_${ p.name }`]"
									type="text"
									id="description"
									class="form-control flex-grow-0 pre-label"
									v-model="p.preLabel"
									placeholder="Pre Label"
								/>
								<input
									type="text"
									id="description"
									class="form-control flex-grow-1"
									v-model="p.label"
								/>
								<input
									v-if="prePostLabels[`post_${ p.name }`]"
									type="text"
									id="description"
									class="form-control flex-grow-0 post-label"
									v-model="p.postLabel"
									placeholder="Post Label"
								/>
							</div>
						</div>

						<div class="form-group mb-3">
							<div class="d-flex align-items-center justify-content-between">
								<label for="description" class="form-label">
									Predefined value for
									<code>{{ p.name }}</code>
								</label>

								<div class="labels d-flex gap-3">
									<platform-toggle-switch
										class="d-flex align-items-center gap-2"
										v-model="p.hidden"
									>
										<template #preSwitch>Hidden</template>
									</platform-toggle-switch>
									<platform-toggle-switch
										class="d-flex align-items-center gap-2"
										v-model="p.readOnly"
									>
										<template #preSwitch>Read-only</template>
									</platform-toggle-switch>
								</div>
							</div>
							<div class="input-group">
								<input
									type="text"
									id="description"
									class="form-control flex-grow-1"
									:placeholder="`Predefined Value for '${ p.name }'`"
									v-model="p.value"
								/>
							</div>
						</div>
					</div>
				</template>
			</div>
		</template>
	</div>
</template>

<script setup>
	const blinkEditor = useBlinkEditor();

	const iconImageRef = ref(null);
	const iconLoading = ref(false);
	const originalIcon = ref('');

	const prePostLabels = ref({});

	watch(() => blinkEditor.customIcon, (value) => {
		if(value) {
			blinkEditor.originalIcon = blinkEditor.blink.icon;
			blinkEditor.blink.icon = value;
		} else {
			blinkEditor.blink.icon = blinkEditor.originalIcon;
		}
	});

	const uploadIcon = async (files) => {

		iconLoading.value = true;

		if(files.length) {
			// Create new form data
			const formData = new FormData();
			formData.append('file', files[0]);
			// Call upload api endpoint
			const { data, error } = await useFetch(`${ useRuntimeConfig().public.baseURL }/upload`, {
				method: 'POST',
				body: formData,
			});

			blinkEditor.customIcon = data.value.data.attachment.metas.location;
		}

		iconLoading.value = false;
		iconImageRef.value.resetFiles();
	};
</script>

<!--suppress SassScssResolvedByNameOnly -->
<style lang="sass" scoped>
	.card-branding
		padding: 1rem

	.form-group
		.form-label
			line-height: 1.1

	.labels
		line-height: 1.1
		font-size: 0.875rem
		white-space: nowrap

	.icon-upload-wrapper
		width: 150px
		max-width: 150px
		border-radius: 0.5rem
		overflow: hidden

		:deep(.icon-upload)
			aspect-ratio: 1

			.drop-zone
				border: 2px dashed var(--bs-border-color)
				padding: 0.5rem
				aspect-ratio: 1
				border-radius: 0.5rem

				.custom-icon

					img
						width: 100%
						object-fit: cover
						aspect-ratio: 1

						&.custom-logo
							object-fit: contain

					.remove
						position: absolute
						background: $danger
						color: white
						z-index: 100
						bottom: 0
						right: 0
						display: flex
						align-items: center
						justify-content: center
						width: 1.5rem
						height: 1.5rem

	h5
		color: var(--bs-primary)
		font-size: 0.8rem
		text-transform: uppercase
		letter-spacing: 0.1rem

	.pre-label,
	.post-label
		width: 100px
</style>
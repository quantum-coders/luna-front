<template>
	<div class="page-branding">
		<h5 class="block-title">Page Branding</h5>
		<div class="d-flex align-items-start gap-3 mb-3">
			<div class="icon-upload-wrapper mt-4">
				<platform-file-upload
					ref="logoImageRef"
					accept="image/jpeg,image/png"
					@update="uploadLogo"
					class="icon-upload"
					:is-loading="logoLoading"
				>
					<template #default>
						<p v-if="!customLogo" class="mb-0 text-center">Drop an logo here</p>
						<div v-else class="custom-icon">
							<img class="custom-logo" alt="" :src="customLogo">
							<a href="#" class="remove" @click="customLogo = ''">
								<icon name="material-symbols:delete-forever-rounded" />
							</a>
						</div>
					</template>
				</platform-file-upload>
			</div>

			<div class="flex-grow-1">
				<div class="form-group mb-3">
					<label for="color" class="form-label">Primary Color</label>
					<platform-color-input v-model="blinkEditor.blink.primaryColor" />
				</div>

				<div class="form-group mb-3">
					<label for="color" class="form-label">Background Color</label>
					<platform-color-input v-model="blinkEditor.blink.backgroundColor" />
				</div>

				<div class="form-group mb-3">
					<label for="background_image" class="form-label">Background Image</label>
					<!-- file input -->
					<template v-if="!blinkEditor.customBackgroundImage">
						<input
							type="file"
							id="background_image"
							class="form-control"
							@change="uploadBackgroundImage"
						/>
					</template>
					<template v-else>
						<div class="d-flex gap-3 align-items-start">
							<div class="custom-background-image">
								<img alt="" :src="blinkEditor.customBackgroundImage">
								<a href="#" class="remove" @click="blinkEditor.customBackgroundImage = ''">
									<icon name="material-symbols:delete-forever-rounded" />
								</a>
							</div>
							<div class="flex-grow-1">
								<!-- select for repeat type -->
								<div class="form-group mb-3">
									<div class="input-group">
										<span class="input-group-text">Repeat</span>
										<select
											id="repeat"
											class="form-select"
											v-model="blinkEditor.blink.backgroundRepeat"
										>
											<option value="no-repeat">No Repeat</option>
											<option value="repeat">Repeat</option>
											<option value="repeat-x">Repeat X</option>
											<option value="repeat-y">Repeat Y</option>
										</select>
									</div>
								</div>

								<div class="row">
									<div class="col-6">
										<div class="form-group mb-3">
											<div class="input-group">
												<span class="input-group-text">
													<icon name="ph:arrows-horizontal" />
												</span>
												<select
													id="x-position"
													class="form-select"
													v-model="blinkEditor.blink.backgroundPositionX"
												>
													<option value="left">Left</option>
													<option value="center">Center</option>
													<option value="right">Right</option>
												</select>
											</div>
										</div>
									</div>

									<div class="col-6">
										<div class="form-group mb-3">
											<div class="input-group">
												<span class="input-group-text">
													<icon name="ph:arrows-vertical" />
												</span>
												<select
													id="y-position"
													class="form-select"
													v-model="blinkEditor.blink.backgroundPositionY"
												>
													<option value="top">Top</option>
													<option value="center">Center</option>
													<option value="bottom">Bottom</option>
												</select>
											</div>
										</div>
									</div>
								</div>

								<div class="row">
									<div class="col-6">
										<!-- select for size -->
										<div class="form-group mb-3">
											<div class="input-group">
												<span class="input-group-text">
													<icon name="ic:baseline-photo-size-select-large" />
												</span>
												<select
													id="size"
													class="form-select"
													v-model="blinkEditor.blink.backgroundSize"
												>
													<option value="auto">Auto</option>
													<option value="cover">Cover</option>
													<option value="contain">Contain</option>
												</select>
											</div>
										</div>
									</div>
									<div class="col-6">
										<!-- input for attachment -->
										<div class="form-group mb-3">
											<div class="input-group">
												<span class="input-group-text">
													<icon name="ph:selection-background-bold" />
												</span>
												<select
													id="attachment"
													class="form-select"
													v-model="blinkEditor.blink.backgroundAttachment"
												>
													<option value="scroll">Scroll</option>
													<option value="fixed">Fixed</option>
												</select>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</template>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
	const blinkEditor = useBlinkEditor();

	const logoLoading = ref(false);
	const logoImageRef = ref(null);
	const customLogo = ref('');

	watch(customLogo, (value) => {
		blinkEditor.blink.logo = value;
	});

	watch(() => blinkEditor.customBackgroundImage, (value) => {
		if(value) {
			blinkEditor.blink.backgroundImage = value;
		} else {
			blinkEditor.blink.backgroundImage = '';
		}
	});

	const uploadLogo = async (files) => {

		logoLoading.value = true;

		if(files.length) {
			// Create new form data
			const formData = new FormData();
			formData.append('file', files[0]);
			// Call upload api endpoint
			const { data, error } = await useFetch(`${ useRuntimeConfig().public.baseURL }/upload`, {
				method: 'POST',
				body: formData,
			});

			customLogo.value = data.value.data.attachment.metas.location;
		}

		logoLoading.value = false;
		logoImageRef.value.resetFiles();
	};

	const uploadBackgroundImage = async (event) => {
		const file = event.target.files[0];
		const formData = new FormData();
		formData.append('file', file);
		const { data } = await useFetch(`${ useRuntimeConfig().public.baseURL }/upload`, {
			method: 'POST',
			body: formData,
		});
		blinkEditor.customBackgroundImage = data.value.data.attachment.metas.location;
	};

</script>

<!--suppress SassScssResolvedByNameOnly -->
<style lang="sass" scoped>

	.custom-background-image
		position: relative
		border-radius: 0.5rem
		overflow: hidden
		width: 150px
		height: 150px
		margin: 0

		img
			width: 100%
			object-fit: cover
			aspect-ratio: 1

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

	.page-branding
		padding: 1rem

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
</style>
<template>
	<section class="blink-editor">

		<div class="connect" v-if="!solana.wallet">
			<div class="copy">
				<h3 class="text-primary">
					<icon name="solar:moon-broken" />
					Blink Editor
					<small class="fs-7">Powered by Solana Blinks</small>
				</h3>
				<p>Connect your wallet and start creating <strong class="text-primary">Luna Blinks</strong>.</p>
				<p>Using
					<icon name="token-branded:solana" />
					Solana Actions, you can turn any transaction into a blockchain link that can be shared anywhere on the internet — no third party application required. Request a payment in a text message. Vote on governance in a chatroom. Buy an NFT on social media.
					<strong class="text-primary">It’s all possible</strong>.
				</p>
			</div>
		</div>

		<div class="editor-wrapper" v-else>

			<div class="editor">
				<p>Select your poison:</p>

				<div class="blink-types mb-3">
					<div class="row">
						<div class="col-4 flex-column d-flex">
							<article
								class="blink-type"
								@click="selectedType = 'memo'"
								:class="{ 'is-selected': selectedType === 'memo' }"
							>
								<h4>Send a Memo</h4>
								<p>Send sweet, sweet memos to the blockchain.</p>
							</article>
						</div>
						<div class="col-4 flex-column d-flex">
							<article
								class="blink-type"
								@click="selectedType = 'transfer-sol'"
								:class="{ 'is-selected': selectedType === 'transfer-sol' }"
							>
								<h4>Transfer SOL</h4>
								<p>Send SOL to your friends and family.</p>
							</article>
						</div>
					</div>
				</div>

				<div class="blink-form" v-if="blink">
					<h5>Card Branding</h5>

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
									<p v-if="!customIcon" class="mb-0 text-center">Drop an icon here</p>
									<div v-else class="custom-icon">
										<img alt="" :src="customIcon">
										<a href="#" class="remove" @click="customIcon = ''">
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
								<input type="text" id="title" class="form-control" v-model="blink.title" />
							</div>

							<!-- description -->
							<div class="form-group">
								<label for="description" class="form-label">Description</label>
								<textarea id="description" class="form-control" v-model="blink.description"></textarea>
							</div>
						</div>
					</div>

					<template v-if="!!blink.links && !!blink.links.actions && !!blink.links.actions.length && !!blink.links.actions[0].parameters">
						<h5>Actions</h5>
						<div class="form-group mb-3">
							<label for="description" class="form-label">Call to action text</label>
							<input
								type="text"
								id="description"
								class="form-control"
								v-model="blink.links.actions[0].label"
							/>
						</div>

						<h5>Actions Parameters</h5>

						<div class="row">
							<template v-for="p in blink.links.actions[0].parameters">
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
								</div>
							</template>
						</div>

						<p class="text-end d-flex gap-2 justify-content-end">
							<a
								target="_blank"
								v-if="finalLink"
								class="btn btn-outline-primary"
								:href="`https://dial.to/?action=solana-action:${ finalLink }`"
							>Test link in Dialect</a>
							<a
								target="_blank"
								v-if="finalLink"
								class="btn btn-outline-primary"
								:href="`${ useRuntimeConfig().public.appURL }/blink?b=${ finalLink }`"
							>Test link in Luna</a>
							<button class="btn btn-primary" @click="generateBlink">Generate Blink</button>
						</p>
					</template>
				</div>
			</div>

			<div class="blink-preview">
				<solana-blink
					:key="selectedType + keyNum"
					v-if="selectedType && blink"
					:blink-object="blink"
				/>
			</div>
		</div>

	</section>
</template>

<script setup>
	definePageMeta({ layout: 'luna' });
	const keyNum = ref(0);

	const selectedType = ref('');

	const loading = ref(false);

	const iconLoading = ref(false);
	const iconImageRef = ref(null);
	const customIcon = ref('');
	const originalIcon = ref('');

	const prePostLabels = ref({});

	const solana = useSolanaStore();
	const blink = ref(null);
	const originalBlink = ref(null);

	const blinkLink = computed(() => {
		return selectedType.value ? `${ useRuntimeConfig().public.baseURL }/blinks/${ selectedType.value }` : null;
	});

	const finalLink = ref('');
	const dialectLink = ref('');

	const fetchBlink = async (url) => {
		const res = await useFetch(url);
		blink.value = res.data.value;

		// store a shallow copy of the original blink
		originalBlink.value = JSON.parse(JSON.stringify(blink.value));
		keyNum.value++;
	};

	watch(customIcon, (value) => {
		console.log(value);
		if(value) {
			originalIcon.value = blink.value.icon;
			blink.value.icon = value;
		} else {
			blink.value.icon = originalIcon.value;
		}
	});

	watch(blinkLink, async (value) => {
		if(value) {
			loading.value = true;
			await fetchBlink(blinkLink.value);
			loading.value = false;
		}
	});

	watch(selectedType, async (value) => {
		if(value) {
			prePostLabels.value = {};
			loading.value = true;
			await fetchBlink(blinkLink.value);
			loading.value = false;
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

			console.log(data, error);

			customIcon.value = data.value.data.attachment.metas.location;
		}

		iconLoading.value = false;
		iconImageRef.value.resetFiles();
	};

	const generateBlink = async () => {

		const baseLink = blinkLink.value;

		let extraParams = {};

		console.log(originalBlink.value, blink.value);

		extraParams = originalBlink.value.icon !== blink.value.icon ? {
			...extraParams,
			icon: blink.value.icon,
		} : extraParams;
		extraParams = originalBlink.value.title !== blink.value.title ? {
			...extraParams,
			title: blink.value.title,
		} : extraParams;
		extraParams = originalBlink.value.description !== blink.value.description ? {
			...extraParams,
			description: blink.value.description,
		} : extraParams;

		// iterate through the actions
		if(originalBlink.value.links.actions.length) {
			console.log('originalBlink', originalBlink.value.links.actions[0].label);
			console.log('blink', blink.value.links.actions[0].label);

			if(originalBlink.value.links.actions[0].label !== blink.value.links.actions[0].label) {
				extraParams = {
					...extraParams,
					'actions[label]': blink.value.links.actions[0].label,
				};
			}

			// iterate through the parameters
			for(const p of originalBlink.value.links.actions[0].parameters) {
				if(p.label !== blink.value.links.actions[0].parameters.find((param) => param.name === p.name).label) {
					extraParams = {
						...extraParams,
						[`p[${ p.name }][label]`]: blink.value.links.actions[0].parameters.find((param) => param.name === p.name).label,
					};
				}
				if(p.preLabel !== blink.value.links.actions[0].parameters.find((param) => param.name === p.name).preLabel) {
					extraParams = {
						...extraParams,
						[`p[${ p.name }][preLabel]`]: blink.value.links.actions[0].parameters.find((param) => param.name === p.name).preLabel,
					};
				}
				if(p.postLabel !== blink.value.links.actions[0].parameters.find((param) => param.name === p.name).postLabel) {
					extraParams = {
						...extraParams,
						[`p[${ p.name }][postLabel]`]: blink.value.links.actions[0].parameters.find((param) => param.name === p.name).postLabel,
					};
				}
			}
		}

		console.log(extraParams);

		let queryString = new URLSearchParams(extraParams).toString();

		queryString = queryString ? '?' + encodeURIComponent(queryString) : '';


		dialectLink.value = 'https://dial.to/?action=solana-action:' + queryString;
		finalLink.value = baseLink + queryString;
	};

</script>

<!--suppress SassScssResolvedByNameOnly -->
<style lang="sass" scoped>
	.blink-editor
		display: flex
		flex-grow: 1
		background: url('/images/starry-night.png') no-repeat right top

		.connect
			padding: 5rem
			flex-grow: 1
			display: flex
			align-items: center

			.copy
				font-size: 1.5rem
				width: 50%

				h3
					font-size: 2.5rem
					margin-bottom: 1rem

	.editor-wrapper
		display: flex
		flex-grow: 1

		.editor
			flex-grow: 1
			padding: 2rem

			.blink-type
				flex-grow: 1
				border: 1px solid var(--bs-border-color)
				border-radius: 0.5rem
				padding: 3rem
				cursor: pointer

				&.is-selected,
				&:hover
					border-color: var(--bs-primary)

				h4
					font-size: 0.75rem
					color: var(--bs-primary)
					text-transform: uppercase
					letter-spacing: 0.1rem
					margin-bottom: 0

				p
					margin-bottom: 0

			.blink-form
				h5
					color: var(--bs-primary)
					font-size: 1rem
					text-transform: uppercase
					letter-spacing: 0.1rem

				.pre-label,
				.post-label
					width: 100px

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

		.blink-preview
			padding: 2rem
			min-width: 450px
			flex-grow: 1
			display: flex
			justify-content: center
			align-items: center
</style>
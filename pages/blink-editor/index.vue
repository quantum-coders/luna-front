<template>
	<section class="blink-editor">
		<platform-loading :active="!!loading" :is-full-page="false" />
		<div class="scroll-wrapper no-gutter">
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
					<blink-editor-selector v-if="!blinkEditor.selectedType" />
					<div v-else class="blink-type">
						<h5>{{ blinkEditor.types[blinkEditor.selectedType].name }}</h5>
					</div>

					<div class="blink-form" v-if="blinkEditor.blink">
						<div class="d-flex justify-content-end p-3" @click.prevent="">
							<div class="dropdown">
								<a
									class="btn btn-primary btn-sm dropdown-toggle"
									href="#"
									role="button"
									data-bs-toggle="dropdown"
									aria-expanded="false"
									@click.prevent="dropdownVisible = true"
									v-click-outside="() => dropdownVisible = false"
								>
									<template v-if="mode === 'page'">
										Page Branding
									</template>
									<template v-else-if="mode === 'card'">
										Card Branding
									</template>
								</a>

								<ul class="dropdown-menu" :class="{ show: dropdownVisible }" @click.prevent="">
									<li>
										<a
											@click.prevent="mode = 'page'"
											class="dropdown-item"
											href="#"
										>Page Branding</a>
									</li>
									<li>
										<a
											@click.prevent="mode = 'card'"
											class="dropdown-item"
											href="#"
										>Card Branding</a>
									</li>
								</ul>
							</div>
						</div>

						<blink-editor-page-branding v-if="mode === 'page'" />
						<blink-editor-card-branding v-else-if="mode === 'card'" />
					</div>

					<p class="generate-actions text-end d-flex gap-2 justify-content-end mb-0" v-if="blinkEditor.blink">
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
				</div>

				<div class="blink-preview" v-if="blinkEditor.blink" :style="previewCSS">
					<header class="blink-header" v-if="blinkEditor.blink.logo">
						<img class="blink-logo" :src="blinkEditor.blink.logo" alt="Logo" />
					</header>

					<div class="blink-wrapper">
						<solana-blink
							:key="blinkEditor.selectedType + blinkEditor.keyNum"
							v-if="blinkEditor.selectedType && blinkEditor.blink"
							:blink-object="blinkEditor.blink"
							:primary-color="blinkEditor.blink.primaryColor"
						/>
					</div>
				</div>
			</div>
		</div>
	</section>
</template>

<script setup>
	definePageMeta({ layout: 'luna' });

	const user = useAuthUser();

	const mode = ref('page');
	const dropdownVisible = ref(false);
	const changeMode = (newMode) => {
		mode.value = newMode;
	};

	const solana = useSolanaStore();
	const blinkEditor = useBlinkEditor();
	const loading = ref(false);

	const prePostLabels = ref({});

	const blinkLink = computed(() => {
		return blinkEditor.selectedType ? `${ useRuntimeConfig().public.baseURL }/blinks/${ blinkEditor.selectedType }` : null;
	});

	const finalLink = ref('');
	const dialectLink = ref('');

	const fetchBlink = async (url) => {
		const res = await useFetch(url);
		blinkEditor.blink = res.data.value;

		// Predefine background values
		if(!blinkEditor.blink.backgroundColor) blinkEditor.blink.background = '#202428';
		if(!blinkEditor.blink.backgroundRepeat) blinkEditor.blink.backgroundRepeat = 'repeat';
		if(!blinkEditor.blink.backgroundPositionX) blinkEditor.blink.backgroundPositionX = 'center';
		if(!blinkEditor.blink.backgroundPositionY) blinkEditor.blink.backgroundPositionY = 'center';
		if(!blinkEditor.blink.backgroundSize) blinkEditor.blink.backgroundSize = 'auto';
		if(!blinkEditor.blink.backgroundAttachment) blinkEditor.blink.backgroundAttachment = 'scroll';
		if(!blinkEditor.blink.backgroundImage) blinkEditor.blink.backgroundImage = '';

		// store a shallow copy of the original blink
		blinkEditor.originalBlink = JSON.parse(JSON.stringify(blinkEditor.blink));
		blinkEditor.keyNum++;
	};

	// compute the css background from the blink
	const previewCSS = computed(() => {
		if(!blinkEditor.blink) return {};

		const background = {};

		if(blinkEditor.blink.backgroundImage) {
			background['background'] = `${ blinkEditor.blink.backgroundColor || '' } url('${ blinkEditor.blink.backgroundImage }') ${ blinkEditor.blink.backgroundPositionX } ${ blinkEditor.blink.backgroundPositionY } / ${ blinkEditor.blink.backgroundSize } ${ blinkEditor.blink.backgroundAttachment } ${ blinkEditor.blink.backgroundRepeat }`;
		} else {
			background['background-color'] = blinkEditor.blink.backgroundColor || '';
		}

		if(blinkEditor.blink.primaryColor) {
			background['--blink-primary-color'] = blinkEditor.blink.primaryColor;
		}

		return background;
	});

	watch(blinkLink, async (value) => {
		if(value) {
			loading.value = true;
			await fetchBlink(blinkLink.value);
			loading.value = false;
		}
	});

	watch(() => blinkEditor.selectedType, async (value) => {
		if(value) {
			prePostLabels.value = {};
			loading.value = true;
			await fetchBlink(blinkLink.value);
			loading.value = false;
		}
	});

	const generateBlink = async () => {

		const baseLink = blinkLink.value;

		let extraParams = {};

		// solve background
		let customBackground;

		// if we hace custom background image, use it with all the properties
		if(blinkEditor.customBackgroundImage) {
			customBackground = `${ blinkEditor.blink.backgroundColor } url('${ blinkEditor.customBackgroundImage }') ${ blinkEditor.blink.backgroundPositionX } ${ blinkEditor.blink.backgroundPositionY } / ${ blinkEditor.blink.backgroundSize } ${ blinkEditor.blink.backgroundAttachment } ${ blinkEditor.blink.backgroundRepeat }`;
		} else {
			// if we have a custom background color, use it
			customBackground = blinkEditor.blink.backgroundColor;
		}

		if(customBackground) {

			extraParams = {
				...extraParams,
				background: customBackground,
			};
		}

		extraParams = blinkEditor.originalBlink.primaryColor !== blinkEditor.blink.primaryColor ? {
			...extraParams,
			primaryColor: blinkEditor.blink.primaryColor,
		} : extraParams;

		extraParams = blinkEditor.originalBlink.logo !== blinkEditor.blink.logo ? {
			...extraParams,
			logo: blinkEditor.blink.logo,
		} : extraParams;

		extraParams = blinkEditor.originalBlink.icon !== blinkEditor.blink.icon ? {
			...extraParams,
			icon: blinkEditor.blink.icon,
		} : extraParams;

		extraParams = blinkEditor.originalBlink.title !== blinkEditor.blink.title ? {
			...extraParams,
			title: blinkEditor.blink.title,
		} : extraParams;

		extraParams = blinkEditor.originalBlink.description !== blinkEditor.blink.description ? {
			...extraParams,
			description: blinkEditor.blink.description,
		} : extraParams;

		// iterate through the actions
		if(blinkEditor.originalBlink.links.actions.length) {
			if(blinkEditor.originalBlink.links.actions[0].label !== blinkEditor.blink.links.actions[0].label) {
				extraParams = {
					...extraParams,
					'actions[label]': blinkEditor.blink.links.actions[0].label,
				};
			}

			// iterate through the parameters
			for(const p of blinkEditor.originalBlink.links.actions[0].parameters) {
				if(p.label !== blinkEditor.blink.links.actions[0].parameters.find((param) => param.name === p.name).label) {
					extraParams = {
						...extraParams,
						[`p[${ p.name }][label]`]: blinkEditor.blink.links.actions[0].parameters.find((param) => param.name === p.name).label,
					};
				}
				if(p.preLabel !== blinkEditor.blink.links.actions[0].parameters.find((param) => param.name === p.name).preLabel) {
					extraParams = {
						...extraParams,
						[`p[${ p.name }][preLabel]`]: blinkEditor.blink.links.actions[0].parameters.find((param) => param.name === p.name).preLabel,
					};
				}
				if(p.postLabel !== blinkEditor.blink.links.actions[0].parameters.find((param) => param.name === p.name).postLabel) {
					extraParams = {
						...extraParams,
						[`p[${ p.name }][postLabel]`]: blinkEditor.blink.links.actions[0].parameters.find((param) => param.name === p.name).postLabel,
					};
				}

				if(p.value !== blinkEditor.blink.links.actions[0].parameters.find((param) => param.name === p.name).value) {
					extraParams = {
						...extraParams,
						[`p[${ p.name }][value]`]: blinkEditor.blink.links.actions[0].parameters.find((param) => param.name === p.name).value,
					};
				}

				if(p.hidden !== blinkEditor.blink.links.actions[0].parameters.find((param) => param.name === p.name).hidden) {
					extraParams = {
						...extraParams,
						[`p[${ p.name }][hidden]`]: blinkEditor.blink.links.actions[0].parameters.find((param) => param.name === p.name).hidden,
					};
				}

				if(p.readOnly !== blinkEditor.blink.links.actions[0].parameters.find((param) => param.name === p.name).readOnly) {
					extraParams = {
						...extraParams,
						[`p[${ p.name }][readOnly]`]: blinkEditor.blink.links.actions[0].parameters.find((param) => param.name === p.name).readOnly,
					};
				}
			}
		}

		loading.value = true;

		// Create blink in the database
		const res = await useBaseFetch('/blinks', {
			method: 'POST',
			body: JSON.stringify(blinkEditor.blink),
		});

		if(res.error.value) {
			usePrettyToast().errorToast('Error generating blink');
		}

		usePrettyToast().successToast('Blink generated successfully');

		let queryString = new URLSearchParams(extraParams).toString();
		queryString = queryString ? '?' + encodeURIComponent(queryString) : '';

		finalLink.value = `${ useRuntimeConfig().public.baseURL }/cb-${ res.data.value.data.uid }`;
		dialectLink.value = 'https://dial.to/?action=solana-action:' + finalLink.value;

		loading.value = false;
	};

</script>

<!--suppress SassScssResolvedByNameOnly -->
<style lang="sass" scoped>

	.dropdown-menu
		position: absolute
		right: 0

	.blink-editor
		display: flex
		flex-grow: 1
		background: url('/images/starry-night.png') no-repeat right top

		.blink-type
			padding: 0.5rem
			border-bottom: 1px solid var(--bs-border-color)
			position: sticky
			top: 0
			background: var(--bs-body-bg)
			z-index: 2

			h5
				margin-bottom: 0

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

		:deep(.block-title)
			text-transform: uppercase
			font-size: 1rem
			color: $primary

	.editor-wrapper
		display: flex
		flex-grow: 1

		.editor
			display: flex
			flex-direction: column
			flex-grow: 1

			.blink-form
				flex-grow: 1

		.generate-actions
			position: sticky
			bottom: 0
			border-top: 1px solid var(--bs-border-color)
			background: var(--bs-body-bg)
			padding: 1rem

		.blink-preview
			border-left: 1px solid var(--bs-border-color)
			height: calc(100dvh - 60px)
			min-width: 550px
			max-width: 550px
			flex-grow: 1
			display: flex
			flex-direction: column
			position: sticky
			top: 0

			.blink-header
				background: rgba(black, 0.75)
				padding: 1rem

				.blink-logo
					width: 100px

			.blink-wrapper
				padding: 2rem
				flex-grow: 1
				flex-direction: column
				display: flex
				justify-content: center
				align-items: center
</style>
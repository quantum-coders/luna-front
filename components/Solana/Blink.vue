<template>
	<div class="blink-card-wrapper">
		<div class="blink-card" v-if="blink" :class="mode">

			<div class="blink-image mb-2">
				<img class="w-100" :src="blink.icon" alt="Blink" />
			</div>

			<div class="blink-data">
				<h3 class="mb-1">{{ blink.title }}</h3>
				<p class="mb-0">{{ blink.description }}</p>
			</div>

			<div class="blink-actions" v-if="!blink.links?.actions">
				<button class="btn btn-primary w-100">{{ blink.label }}</button>
			</div>

			<div class="blink-actions gap-2 d-flex flex-wrap" v-else>
				<article class="action" v-for="a in blink.links.actions">
					<template v-if="!a.parameters">
						<button
							@click.prevent="postBlink(a)"
							class="btn btn-primary w-100 solo-action"
							:class="{ 'btn-loading': a.loading }"
						>{{ a.label }}
						</button>
					</template>

					<template v-else>
						<!-- input group -->
						<div class="input-group">
							<template v-for="p in a.parameters">
								<!-- label -->
								<div class="d-flex">
									<span
										v-if="p.preLabel"
										class="input-group-text"
										id="basic-addon1"
									>{{ p.preLabel }}</span>
									<input
										type="text"
										class="form-control"
										:placeholder="p.label"
										v-model="p.value"
										:name="p.name"
										:disabled="a.loading"
									/>
									<span
										v-if="p.postLabel"
										class="input-group-text"
										id="basic-addon1"
									>{{ p.postLabel }}</span>
								</div>
							</template>
							<button
								class="btn btn-primary"
								:class="{ 'btn-loading': a.loading }"
								@click="postBlink(a)"
							>{{ a.label }}
							</button>
						</div>
					</template>
				</article>
			</div>

			<p class="powered">
				Powered by
				<icon name="token-branded:solana" />
				Blinks and
				<icon name="bi:moon-stars-fill" />
				.AI
			</p>
		</div>
	</div>
</template>

<script setup>

	const props = defineProps({
		blinkUrl: {
			type: String,
			default: '',
		},
		blinkObject: {
			type: Object,
			default: () => ({}),
		},
		mode: {
			type: String,
			default: 'card',
		},
		parameters: {
			type: Object,
			default: () => ({}),
		},
	});

	const blink = ref(null);

	// fetch the b
	const fetchBlink = async () => {

		if(Object.keys(props.blinkObject).length > 0) {
			blink.value = props.blinkObject;
			return;
		}

		const res = await useFetch(props.blinkUrl);
		blink.value = res.data.value;
	};

	const postBlink = async (action) => {

		action.loading = true;
		let url = '';

		// if action.href does not start with http, use the domain from b
		if(!action.href.startsWith('http')) {
			url = new URL(action.href, props.blinkUrl).href;
		} else {
			url = action.href;
		}

		// if parameters are present
		if(action.parameters) {
			// loop through the parameters
			for(const p of action.parameters) {
				console.log(p.name, p[p.name]);
				// replace the parameter in the url
				url = url.replace(`%7B${ p.name }%7D`, p[p.name]);
				url = url.replace(`{${ p.name }}`, p[p.name]);
			}
		}

		const res = await useFetch(url, {
			method: 'POST',
			body: JSON.stringify({
				account: useSolanaStore().wallet,
			}),
		});

		console.log('before');
		if(res.error.value) {
			console.error(res.error.value);
			action.loading = false;
			return;
		}
		console.log('after');
		await useSolanaStore().signEncodedTransaction(res.data.value.transaction);

		action.loading = false;
	};

	onMounted(() => {
		fetchBlink();
	});
</script>

<!--suppress SassScssResolvedByNameOnly -->
<style lang="sass" scoped>

	.blink-card-wrapper
		container-type: inline-size
		width: 100%

		.blink-card
			margin: 0 auto
			container-type: inline-size
			background: var(--bs-body-bg)
			padding: 1rem
			border-radius: 0.5rem
			box-shadow: 0 0 10px rgba(0, 0, 0, 0.1)
			max-width: 500px
			width: 100%
			overflow: hidden
			overflow-y: auto
			white-space: pre-wrap
			word-wrap: break-word
			hyphens: auto
			font-size: 0.9rem
			line-height: 1.5
			color: var(--bs-body-color)
			transition: all 0.5s ease

			.blink-image
				aspect-ratio: 1

				img
					border-radius: 0.5rem
					aspect-ratio: 1
					object-fit: cover

			.blink-data
				margin-bottom: 1rem

			.blink-actions
				margin-bottom: 1rem

				.action:has(.solo-action)
					flex-grow: 1
					flex-basis: calc((100% / 3.2))

				.action:has(.input-group)
					flex-basis: 100%

			p.powered
				text-align: right
				margin-bottom: 0
				font-size: 0.75rem

			&.compact
				display: flex
				flex-wrap: wrap
				gap: 0.5rem
				max-width: 100%

				.blink-image
					width: 70px
					float: left

				.blink-data
					display: flex
					flex-direction: column
					justify-content: center

				.blink-actions
					flex-grow: 1
					flex-basis: 100%
					margin-bottom: 0

				.blink-info
					display: flex
					flex-grow: 1
					flex-direction: column

				.powered
					width: 100%

		@container (max-width: 500px)

			.blink-card.compact .blink-image
				width: 80px

			.action .input-group
				flex-direction: column
				gap: 0

				& > *
					margin: 0 !important

				& > div:first-child > .form-control
					border-radius: var(--bs-border-radius) var(--bs-border-radius) 0 0
					border-bottom: 0

				& > div:first-child > .input-group-text:first-child
					border-radius: var(--bs-border-radius) 0 0 0
					border-bottom: 0

				& > div:first-child > .input-group-text:last-child
					border-radius: 0 var(--bs-border-radius) 0 0
					border-bottom: 0

				& > div:first-child:has(.input-group-text:first-child) > .form-control
					border-radius: 0 var(--bs-border-radius) 0 0
					border-left: 0

				& > div:first-child:has(.input-group-text:last-child) > .form-control
					border-radius: var(--bs-border-radius) 0 0 0
					border-right: 0

				& > div:not(:last-child):not(:first-child) > .form-control
					width: 100%
					flex-grow: 1
					border-radius: 0
					border-bottom: 0

				& > div:not(:last-child):not(:first-child) > .input-group-text:first-child
					border-radius: 0
					border-bottom: 0
					border-right: 0

				& > div:not(:last-child):not(:first-child) > .input-group-text:last-child
					border-radius: 0
					border-bottom: 0
					border-left: 0

				& > div:last-child > .form-control,
				& > *:last-child
					margin: 0
					border-radius: 0 0 var(--bs-border-radius) var(--bs-border-radius) !important
</style>
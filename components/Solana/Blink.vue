<template>
	<div
		class="blink-card-wrapper"
		:style="{ '--blink-primary-color': primaryColor || '#69F89B', '--blink-complementary-color': complementaryColor }"
	>

		<div class="blink-card" v-if="blink" :class="mode">
			<div class="card-connect" v-if="!!cardConnect">
				<div class="d-none d-sm-block">
					<solana-wallet-connect/>
				</div>
				<div class="mobile-connect d-block d-sm-none">
					<a
						href="#"
						v-if="!solanaStore.wallet"
						class="btn btn-sm btn-primary"
						@click.prevent="solanaStore.mobileConnect"
					>Connect Wallet</a>
					<a href="#" v-else class="btn btn-sm btn-primary">
						<!-- show wallet address with ellipsis -->
						{{ solanaStore.wallet.slice(0, 4) }}...{{ solanaStore.wallet.slice(-4) }}
					</a>
				</div>
			</div>

			<div class="blink-image mb-2">
				<slot name="image"></slot>
				<img :src="blink.icon" alt="Blink"/>
			</div>

			<div class="blink-data">
				<h3 class="mb-1">{{ blink.title }}</h3>
				<p class="mb-0">{{ blink.description }}</p>
			</div>

			<slot name="actions">
				<div class="blink-actions" v-if="!blink.links?.actions">
					<button class="btn btn-primary w-100">{{ blink.label }}</button>
				</div>

				<div class="blink-actions gap-2 d-flex flex-wrap" v-else>
					<div class="alert alert-success w-100 text-center" v-if="txResult">
						Great, transaction was successful. <a :href="txResult" target="_blank">Go to transaction</a>
					</div>
					<template v-for="a in blink.links.actions">
						<article
							class="action"
							:class="`parameters-count-${ a.parameters.length }`"
						>
							<template
								v-if="a.parameters && a.parameters.find(param => param.name === 'inputMint') && a.parameters.find(param => param.name === 'outputMint')">
								<solana-quote v-if="tokenStore.quote"/>
							</template>
							<template v-if="a.parameters && a.parameters.find(param => param.name === 'inputMint') && a.parameters.find(param => param.name === 'outputMint')
							&& a.href === '/blinks/create-limit-order?=inputMint={inputMint}&outputMint={outputMint}&inAmount={inAmount}&outAmount={outAmount}&expiredAt={expiredAt}'
							">
								<solana-limit-order-profit v-if="tokenStore.quote"
									:profitPercentage="tokenStore.profitPercentage"
								/>
							</template>
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
										<div class="d-flex flex-grow-1" v-if="p.name ==='metadata'">
											<solana-metadata @update-metadata="p.value =  $event"/>
										</div>
										<div class="d-flex flex-grow-1" v-if="p.name === 'inputMint'">
											<solana-token-selector
												v-model="p.value"
											/>
										</div>
										<div class="d-flex justify-content-center pb-2" v-if="p.name === 'outputMint'">
											<button
												class="btn btn-primary"
												@click="swapTokensOrder"
											>
												<icon name="bi:arrow-left-right"/>
											</button>
										</div>

										<div class="d-flex flex-grow-1" v-if="p.name === 'outputMint'">
											<solana-token-selector
												v-model="p.value"
											/>
										</div>
										<div class="d-flex flex-grow-1"
											 v-if="!p.hidden && p.name !== 'metadata' && p.name !== 'inputMint' && p.name !== 'outputMint'">
											<span
												v-if="!!p.preLabel"
												class="input-group-text"
												id="basic-addon1"
											>{{ p.preLabel }}</span>
											<input
												:type="getType(p)"
												class="form-control"
												:placeholder="p.label"
												v-model="p.value"
												:name="p.name"
												:disabled="a.loading"
												:readonly="!!p.readOnly"
											/>
											<span
												v-if="!!p.postLabel"
												class="input-group-text"
												id="basic-addon1"
											>{{ p.postLabel }}</span>
										</div>
									</template>
									<button
										class="btn btn-primary"
										:class="{ 'btn-loading': a.loading }"
										@click="postBlink(a)"
										:disabled="solveButtonDisabled(a)"
									>{{ a.label }}
									</button>
								</div>
							</template>
						</article>
					</template>
				</div>
			</slot>

			<p class="powered">
				Powered by
				<icon name="token-branded:solana"/>
				Blinks and
				<icon name="bi:moon-stars-fill"/>
				.AI
			</p>
		</div>
	</div>
</template>

<script setup>
	const txResult = ref('');
	const solanaStore = useSolanaStore();
	const tokenStore = useTokenStore();
	const emit = defineEmits(['transactionSuccessful']);

	const props = defineProps({
		blinkUrl: {
			type: String,
			required: true,
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
		primaryColor: {
			type: String,
			default: '#69F89B',
		},
		cardConnect: {
			type: Boolean,
			default: false,
		},
		signTransaction: {
			type: [Function, null],
			default: null,
		},
	});

	const blink = ref(null);


	/// getType if it is inAmount or inputAmount is number
	const getType = (param) => {
		if (param.name === 'inAmount' || param.name === 'outAmount') {
			return 'number';
		}
		if(param.name === 'expiredAt'){
			return 'datetime-local';
		}
		return 'text';
	};
	const swapTokensOrder = () => {
		const inputMint = blink.value.links.actions[0].parameters.find(param => param.name === 'inputMint')
		const outputMint = blink.value.links.actions[0].parameters.find(param => param.name === 'outputMint')
		const temp = inputMint.value
		inputMint.value = outputMint.value
		outputMint.value = temp
	}
	// calculate the complementary color from the primary color, black or white
	const complementaryColor = computed(() => {
		const hex = props.primaryColor.replace('#', '');
		const r = parseInt(hex.substring(0, 2), 16);
		const g = parseInt(hex.substring(2, 4), 16);
		const b = parseInt(hex.substring(4, 6), 16);
		const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
		return (yiq >= 128) ? 'black' : 'white';
	});

	// fetch the b
	const fetchBlink = async () => {

		if (Object.keys(props.blinkObject).length > 0) {
			blink.value = props.blinkObject;
			return;
		}

		const res = await useFetch(props.blinkUrl);
		blink.value = res.data.value;
	};

	const solveButtonDisabled = (action) => {
		if (action.parameters) {
			for (const p of action.parameters) {
				if (p.required && !p.value) {
					return true;
				}
			}
		}
		return false;
	};

	const postBlink = async (action) => {

		action.loading = true;
		let url = '';

		// if action.href does not start with http, use the domain from b
		if (!action.href.startsWith('http')) {
			url = new URL(useRuntimeConfig().public.baseURL + action.href, props.blinkUrl).href;

		} else {
			url = action.href;
		}

		// if parameters are present
		if (action.parameters) {
			// loop through the parameters
			for (const p of action.parameters){
				console.info("------------------> Parameter", p)
				// replace the parameter in the url
				url = url.replace(`%7B${p.name}%7D`, p.value);
				url = url.replace(`{${p.name}}`, p.value);
			}
		}
		// uri encode the url
		url = encodeURI(url);
		const res = await useFetch(url, {
			method: 'POST',
			body: JSON.stringify({
				account: useSolanaStore().wallet,
			}),
		});

		if (res.error.value) {
			console.error(res.error.value);
			action.loading = false;
			return;
		}

		try {
			if (props.signTransaction) {
				await props.signTransaction(res.data.value.data.transaction, action);

			} else {
				txResult.value = await useSolanaStore().signEncodedTransaction(res.data.value.transaction);
				emit('transactionSuccessful', txResult.value);
				action.loading = false;
			}
		} catch (e) {
			console.error(e);
			action.loading = false;
		}
	};

	onMounted(() => {
		fetchBlink();
	});

	watch(
		() => blink.value,
		(newBlink) => {
			if (newBlink && newBlink.links && newBlink.links.actions) {
				for (const action of newBlink.links.actions) {
					const inputMint = action.parameters?.find(param => param.name === 'inputMint')?.value
					const outputMint = action.parameters?.find(param => param.name === 'outputMint')?.value
					tokenStore.inAmount = action.parameters?.find(param => param.name === 'inAmount')?.value || 0
					tokenStore.outAmount = action.parameters?.find(param => param.name === 'outAmount')?.value || 0
					if (inputMint && outputMint && tokenStore.inputToken !== inputMint && tokenStore.outputToken !== outputMint) {
						console.info("inputMint", inputMint, "outputMint", outputMint)
						console.info("tokenStore.inputToken?.address", tokenStore.inputToken, "tokenStore.outputToken?.address", tokenStore.outputToken)
						tokenStore.getQuote(inputMint, outputMint)
						break // Salimos del bucle una vez que encontramos ambos valores
					}
				}
			}
		},
		{deep: true, immediate: true}
	)

</script>

<!--suppress SassScssResolvedByNameOnly -->
<style lang="sass" scoped>

	.btn.btn-primary
		background: var(--blink-primary-color, #69F89B)
		border-color: var(--blink-primary-color, #69F89B)
		color: var(--blink-complementary-color, white)

	.blink-card-wrapper
		container-type: inline-size
		width: 100%

		.card-connect
			position: absolute
			top: 0.5rem
			right: 0.5rem
			z-index: 2

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
				width: 100%

				img
					border-radius: 0.5rem
					aspect-ratio: 1
					object-fit: cover
					width: 100%

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

			.action:not(.parameters-count-1) .input-group
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

			.parameters-count-1 .input-group
				flex-direction: row

				.form-control
					border-bottom: 1px solid var(--bs-border-color) !important
					border-radius: var(--bs-border-radius) 0 0 var(--bs-border-radius) !important
					border-right: 0

					&:focus
						border-color: var(--bs-primary) !important

				.btn
					border-radius: 0 var(--bs-border-radius) var(--bs-border-radius) 0 !important

		@container (min-width: 501px)

			.action .input-group
				gap: 0

				& > *
					margin: 0 !important

				& > div:first-child > .form-control
					border-radius: var(--bs-border-radius) 0 0 var(--bs-border-radius)
					border-right: 0

				& > div:first-child > .input-group-text:first-child
					border-radius: var(--bs-border-radius) 0 0 var(--bs-border-radius)
					border-right: 0

				& > div:first-child > .input-group-text:last-child
					border-radius: 0
					border-right: 0

				& > div:first-child:has(.input-group-text:first-child) > .form-control
					border-radius: 0 var(--bs-border-radius) var(--bs-border-radius) 0
					border-right: 0

				& > div:first-child:has(.input-group-text:last-child) > .form-control
					border-radius: var(--bs-border-radius) 0 0 var(--bs-border-radius)
					border-right: 0

				& > div:first-child:has(.input-group-text:first-child):has(.input-group-text:last-child) > .form-control
					border-radius: 0
					border-right: 0

				& > div:not(:last-child):not(:first-child) > .form-control
					width: 100%
					flex-grow: 1
					border-radius: 0
					border-right: 0

				& > div:not(:last-child):not(:first-child) > .input-group-text:first-child
					border-radius: 0
					border-right: 0

				& > div:not(:last-child):not(:first-child) > .input-group-text:last-child
					border-radius: 0
					border-right: 0

				& > div:last-child > .form-control,
				& > *:last-child
					margin: 0
					border-radius: 0 var(--bs-border-radius) var(--bs-border-radius) 0 !important
</style>

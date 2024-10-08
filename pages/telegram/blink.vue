<template>
	<div class="blink-wrapper d-flex flex-column flex-grow-1" :style="cssVars" :class="{ 'embed': !!embed }">
		<header class="blink-header d-flex align-items-center" v-if="!embed">
			<div class="logo-wrapper">
				<template v-if="blink && blink.logo">
					<img :src="blink.logo" alt="Logo" class="header-custom-logo" />
				</template>
				<svgo-luna-logo v-else class="logo" />
			</div>

			<div class="header-tools d-flex ms-auto align-items-center justify-content-end gap-2">

				<platform-theme-switcher />

				<button
					v-if="!walletConnected && !solana.wallet"
					class="connect-to-wallet-button"
					@click="connectToWallet"
				>Connect to Wallet
				</button>

				<div class="wallet" v-else>
					<!-- show wallet address with ellipsis -->
					{{ solana.wallet.slice(0, 4) }}...{{ solana.wallet.slice(-4) }}

					<a href="#" @click.prevent="disconnectWallet">
						<icon name="fluent:plug-disconnected-20-filled" />
					</a>
				</div>
			</div>
		</header>

		<div class="the-blink" v-if="blink">
			<solana-emoji-rain
				class="emoji-rain"
				:emojis="['⭐', '✨', '🌟', '🌙']"
				:speed="10"
				:density="50"
				:spawn="success"
			/>
			<solana-blink
				:class="{ 'not-connected' : !walletConnected }"
				:blink-object="blink"
				:blink-url="b"
				:primaryColor="blink.primaryColor"
				:sign-transaction="signTransaction"
				@transaction-successful="transactionSuccessful"
			>
				<template #image v-if="!walletConnected">
					<div class="alert not-connected">Please connect your wallet before using this blink</div>
				</template>

				<template #actions v-if="transactionSignature">
					<div class="alert alert-success">
						<p class="mb-0">Champion! You have successfully signed the transaction.<br><a :href="`https://solscan.io/tx/${ transactionSignature }`">Here the proof</a>.
						</p>
					</div>
				</template>
			</solana-blink>
		</div>
	</div>
</template>

<script setup>
	import bs58 from 'bs58';
	import { Buffer } from 'buffer';

	useHead({
		script: [
			{
				src: 'https://telegram.org/js/telegram-web-app.js',
			},
		],
	});

	const solana = useSolanaStore();
	const walletJustConnected = ref(false);
	const transactionSignature = ref(false);

	// check if wallet is in localStorage
	if(localStorage.getItem('lunaMiniAppPK')) {
		solana.wallet = localStorage.getItem('lunaMiniAppPK');
	}

	// compute the tgWebAppStartParam value in localStorage
	const walletConnected = computed(() => {
		return !!((localStorage.getItem('lunaMiniAppPK') && localStorage.getItem('lunaMiniAppWalletSession') || walletJustConnected.value) && solana.wallet);
	});

	const connectToWallet = async () => {
		try {
			const publicKey = useRuntimeConfig().public.walletPK;
			const appUrl = useRuntimeConfig().public.appURL;
			const bypassLink = `${ appUrl }/telegram-bypass?startapp=${ useRoute().query.tgWebAppStartParam }`;
			const deepLinkUrl = solana.createConnectDeepLinkUrl(appUrl, bypassLink, publicKey, 'phantom');

			window.open(deepLinkUrl, '_blank');

			// wait 3 seconds
			await new Promise(resolve => setTimeout(resolve, 3000));
			window.Telegram.WebApp.close();

		} catch(error) {
			console.error('Connection error:', error);
		}
	};

	// get the b parameter from the query string
	const { query } = useRoute();
	const b = ref('');
	const blink = ref(null);

	const solanaStore = useSolanaStore();

	// check if the param embed is set to 1
	const embed = query.embed === '1';

	if(!!query.mode) {
		document.documentElement.setAttribute('data-bs-theme', query.mode);
	}

	const success = ref(false);

	const fetchBlink = async () => {
		const res = await useFetch(b.value);
		blink.value = res.data.value;
	};

	const cssVars = computed(() => {

		if(!blink.value) return {};

		const vars = {};

		if(blink.value.backgroundImage) {
			vars['--blink-background'] = `${ blink.value.backgroundColor || '' } url('${ blink.value.backgroundImage }') ${ blink.value.backgroundPositionX } ${ blink.value.backgroundPositionY } / ${ blink.value.backgroundSize } ${ blink.value.backgroundAttachment } ${ blink.value.backgroundRepeat }`;
			vars['--blink-header-background'] = 'var(--bs-body-bg-rgb)';
		} else {
			vars['--blink-background'] = blink.value.backgroundColor;
			if(blink.value.background) {
				vars['--blink-header-background'] = 'var(--bs-body-bg-rgb)';
			}
		}

		if(blink.value.primaryColor) {
			vars['--bs-btn-bg'] = blink.value.primaryColor;
		}

		return vars;
	});

	const disconnectWallet = () => {
		localStorage.removeItem('lunaMiniAppPK');
		localStorage.removeItem('lunaMiniAppWalletSession');
		localStorage.removeItem('lunaMiniAppEncryptionPK');
		walletJustConnected.value = false;
		solana.wallet = '';
	};

	const signTransaction = async (transaction, action) => {

		const transactionBuffer = Buffer.from(transaction, 'base64');
		transaction = bs58.encode(transactionBuffer);

		const payload = {
			transaction,
			session: localStorage.getItem('lunaMiniAppWalletSession'),
			sendOptions: {},
		};

		const encodeRes = await useFetch(`${ useRuntimeConfig().public.baseURL }/web3/encode-wallet`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				encryptionPK: localStorage.getItem('lunaMiniAppEncryptionPK'),
				payload,
			}),
		});

		const encodeResData = encodeRes.data.value.data;

		// create query string
		const queryString = new URLSearchParams();

		queryString.append('dapp_encryption_public_key', useRuntimeConfig().public.walletPK);
		queryString.append('transaction', transaction);
		queryString.append('nonce', encodeResData.nonce);

		let params = atob(useRoute().query.tgWebAppStartParam);
		params = params + `&signed=1&epk=${ localStorage.getItem('lunaMiniAppEncryptionPK') }`;
		params = btoa(params);

		queryString.append('redirect_link', `${ useRuntimeConfig().public.appURL }/telegram-bypass?startapp=${ params }`);
		queryString.append('payload', encodeResData.payload);

		const transactionDeepLink = `https://phantom.app/ul/v1/signAndSendTransaction?${ queryString.toString() }`;
		console.log('Transaction deep link', transactionDeepLink);
		window.open(transactionDeepLink, '_blank');

		// wait 3 seconds
		await new Promise(resolve => setTimeout(resolve, 3000));
		window.Telegram.WebApp.close();
	};

	const transactionSuccessful = () => {
		success.value = true;

		// wait 5 seconds and then reset the success state
		setTimeout(() => {
			success.value = false;
		}, 5000);
	};

	const waitForTelegramWebApp = (callback) => {
		if(window.Telegram && window.Telegram.WebApp) {
			callback();
		} else {
			setTimeout(() => waitForTelegramWebApp(callback), 100);
		}
	};

	onMounted(() => {
		waitForTelegramWebApp(function() {
			// Execute your code here
			console.log('Telegram Web App is ready');

			let startApp = useRoute().query.tgWebAppStartParam;
			startApp = atob(startApp);

			// startApp is a query string, convert it to an object
			const startAppParams = new URLSearchParams(startApp);

			// print the params
			for(const [key, value] of startAppParams) {
				console.log(key, value);
			}

			// check if luna-action is present
			if(startAppParams.has('luna-action')) {
				const lunaAction = startAppParams.get('luna-action');

				b.value = 'https://appapi.lunadefi.ai/blinks/' + lunaAction;
				fetchBlink();
			}

			if(startAppParams.has('public-key') && startAppParams.has('session') && startAppParams.has('encryption-public-key')) {
				localStorage.setItem('lunaMiniAppPK', startAppParams.get('public-key'));
				localStorage.setItem('lunaMiniAppWalletSession', startAppParams.get('session'));
				localStorage.setItem('lunaMiniAppEncryptionPK', startAppParams.get('encryption-public-key'));
				walletJustConnected.value = true;

				solana.wallet = startAppParams.get('public-key');

			} else if(startAppParams.has('signature')) {

				transactionSignature.value = startAppParams.get('signature');
				transactionSuccessful();
			}
		});

	});

</script>

<!--suppress SassScssResolvedByNameOnly -->
<style lang="sass" scoped>

	.alert.not-connected
		position: absolute
		z-index: 10
		border: 1px solid $danger
		width: calc(100% - 2rem)
		margin: 1rem
		background: $danger
		text-align: center
		outline: 0.25rem solid var(--bs-body-bg)

	.connect-to-wallet-button
		border: 0
		white-space: nowrap
		padding: 0.25rem 1rem
		border-radius: 1rem

	.emoji-rain
		z-index: 0
		pointer-events: none
		background: transparent

	&:has(.embed)
		.blink-wrapper
			background: transparent !important

	.blink-wrapper
		background: var(--blink-background, var(--bs-body-bg-rgb))
		justify-content: center

	.blink-card-wrapper.not-connected
		pointer-events: none

	.blink-header
		padding: 0.5rem 1rem
		position: fixed
		top: 0
		left: 0
		width: 100%
		z-index: 1000
		background: rgba(var(--blink-header-background, var(--bs-body-bg-rgb)), 0.85)

		@media (min-width: $sm)
			padding: 0.5rem 1rem

		.logo-wrapper
			display: flex
			align-items: center
			gap: 1rem

			.header-icon
				background: var(--bs-light-bg-subtle)
				width: 60px
				height: 59px
				justify-content: center
				align-items: center
				font-size: 1.5rem
				display: none

				@media (min-width: $sm)
					display: flex

			.logo
				width: auto
				height: 40px

			.header-custom-logo
				width: auto
				height: 30px
				margin: 5px

		.header-tools
			min-width: 200px

	.the-blink
		display: flex
		justify-content: center
		align-items: center
		flex-grow: 1
		z-index: 1
		padding: 58px 1rem 1rem 1rem

		@media (min-width: $sm)
			padding: 0

	&:has(.embed)
		.the-blink
			flex-direction: column
			display: flex
			justify-content: stretch
			align-items: stretch

			.blink-card-wrapper
				flex-grow: 1
				display: flex
				background: var(--bs-body-bg)

				:deep(.blink-card)
					justify-content: center
					flex-grow: 1
					border: 0

</style>

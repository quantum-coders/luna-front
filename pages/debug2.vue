<template>
	<div class="container mt-4">
		<div class="d-flex flex-column justify-content-center">
			<button
				class="btn btn-primary"
				@click="connectToPhantom"
			>Connect to Phantom Wallet
			</button>

			<pre>DESDE QUERY: {{ tgWebAppStartParam }}</pre>
			<pre>DESDE LocalStorage: {{ tgWebAppStartParamLocalStorage }}</pre>

			<button
				class="btn btn-primary"
				@click="signAndSendTransaction"
			>Sign and Send Transaction
			</button>
		</div>
	</div>
</template>

<script setup>
	import nacl from 'tweetnacl';
	import bs58 from 'bs58';
	import { Buffer } from 'buffer';

	useHead({
		script: [
			{
				src: 'https://telegram.org/js/telegram-web-app.js',
				defer: true,
			},
		],
	});

	const sessionData = ref(null);
	const connectionError = ref(null);

	const createDeepLinkUrl = (appUrl, redirectUrl, publicKey) => {
		const encodedAppUrl = encodeURIComponent(appUrl);
		const encodedRedirectUrl = encodeURIComponent(redirectUrl);
		return `https://phantom.app/ul/v1/connect?app_url=${ encodedAppUrl }&dapp_encryption_public_key=${ publicKey }&same_tab=true&redirect_link=${ encodedRedirectUrl }`;
	};

	const connectToPhantom = async () => {
		try {
			if(!sessionData.value) {
				const publicKey = useRuntimeConfig().public.walletPK;
				const appUrl = useRuntimeConfig().public.appURL;
				const bypassLink = `${ appUrl }/debug3`;
				const deepLinkUrl = createDeepLinkUrl(appUrl, bypassLink, publicKey);

				window.open(deepLinkUrl, '_blank');
			} else {
				console.log('Already connected to Phantom. Session data:', sessionData.value);
			}
		} catch(error) {
			connectionError.value = 'Error connecting to Phantom Wallet.';
			console.error('Connection error:', error);
		}
	};

	// compute the query param tgWebAppStartParam
	const tgWebAppStartParam = computed(() => {
		return useRoute().query.tgWebAppStartParam;
	});

	// compute the tgWebAppStartParam value in localStorage
	const tgWebAppStartParamLocalStorage = computed(() => {
		return localStorage.getItem('tgWebAppStartParam');
	});

	const signAndSendTransaction = async () => {
		if(tgWebAppStartParamLocalStorage.value) {

			// split tgWebAppStartParamLocalStorage.value by '-'
			const tgWebAppStartParamLocalStorageValue = tgWebAppStartParamLocalStorage.value.split('-');

			// do something with the value
			const blinkRes = await useFetch('https://appapi.lunadefi.ai/blinks/transfer-sol?to=Gqs7Bxt5gBrH7RUygsbFLVybEQxUbdMkHZUbUCkF4ngV&amount=0.001', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					account: tgWebAppStartParamLocalStorageValue[0],
				}),
			});

			const transaction = blinkRes.data.value.data.transaction;
			const publicKey = useRuntimeConfig().public.walletPK;

			const nonce = nacl.randomBytes(nacl.secretbox.nonceLength);
			const nonceBase58 = bs58.encode(nonce);

			const appUrl = useRuntimeConfig().public.appURL;
			const bypassLink = `${ appUrl }/debug3`;

			const payloadRaw = {
				transaction,
				session: tgWebAppStartParamLocalStorageValue[1],
				sendOptions: {},
			};

			const payloadJSON = JSON.stringify(payloadRaw);

			const encryptionKey = bs58.decode(publicKey);
			const encryptedPayload = nacl.secretbox(
				Buffer.from(payloadJSON),
				nonce,
				encryptionKey,
			);

			// Encode the encrypted payload in base58
			const encryptedPayloadBase58 = bs58.encode(encryptedPayload);
			const transactionDeepLink = `https://phantom.app/ul/v1/signAndSendTransaction?dapp_encryption_public_key=${ publicKey }&transaction=${ transaction }&nonce=${ nonceBase58 }&redirect_link=${ bypassLink }&payload=${ encryptedPayloadBase58 }`;

			// open the transactionDeepLink in a new tab
			window.open(transactionDeepLink, '_blank');
		}
	};

	onMounted(async () => {
		// check if there is something in the query param tgWebAppStartParam
		if(tgWebAppStartParam.value) {
			// save it to localStorage
			localStorage.setItem('tgWebAppStartParam', tgWebAppStartParam.value);
		}
	});

</script>

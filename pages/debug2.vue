<template>
	<div class="container mt-4">
		<div class="d-flex justify-content-center">
			<button
				class="btn btn-primary"
				@click="connectToPhantom"
			>Connect to Phantom Wallet
			</button>
		</div>
	</div>
</template>

<script setup>
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

	const getPublicKey = async () => {
		const { data, error } = await useBaseFetch('/web3/public-key', {
			method: 'GET',
		});

		return data.value.data;
	};

	function createDeepLinkUrl(appUrl, redirectUrl, publicKey) {
		const encodedAppUrl = encodeURIComponent(appUrl);
		const encodedRedirectUrl = encodeURIComponent(redirectUrl);
		console.log('createDeepLinkUrl', `https://phantom.app/ul/v1/connect?app_url=${ encodedAppUrl }&dapp_encryption_public_key=${ publicKey }&same_tab=true&${ encodedRedirectUrl }`);
		return `https://phantom.app/ul/v1/connect?app_url=${ encodedAppUrl }&dapp_encryption_public_key=${ publicKey }&same_tab=true&redirect_link=${ encodedRedirectUrl }`;
	}

	const connectToPhantom = async () => {
		try {
			if(!sessionData.value) {
				const publicKey = await getPublicKey();

				const appUrl = useRuntimeConfig().public.appURL;
				const telegramDeepLink = `${ appUrl }/debug3`;
				const deepLinkUrl = createDeepLinkUrl(appUrl, telegramDeepLink, publicKey);

				window.open(deepLinkUrl, '_blank');
			} else {
				console.log('Already connected to Phantom. Session data:', sessionData.value);
			}
		} catch(error) {
			connectionError.value = 'Error connecting to Phantom Wallet.';
			console.error('Connection error:', error);
		}
	};

	const disconnectFromPhantom = () => {
		sessionData.value = null;
		localStorage.removeItem('phantomSession');
		console.log('Disconnected from Phantom Wallet');
	};

	// Listener para el evento 'storage'
	onMounted(() => {
	});

</script>

<template>
	<button @click="connectToPhantom">Connect to Phantom Wallet</button>
</template>

<script setup>

	const connectToPhantom = () => {
		// Your deep-link URL for Phantom with app_url set to app.lunadefi.ai
		const deepLinkUrl = 'https://phantom.app/ul/v1/connect?app_url=https://app.lunadefi.ai&dapp_encryption_public_key=your-public-key&redirect_link=https://your-redirect-url.com';
		window.open(deepLinkUrl, '_blank');
	};
</script>

<!--suppress SassScssResolvedByNameOnly -->
<style lang="sass" scoped>

</style>
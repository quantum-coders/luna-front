<template>
	<pre>{{ payloadData }}</pre>
</template>

<script setup>

	const payloadData = ref('');

	const decodeWalletPayload = async () => {
		const { data, error } = await useBaseFetch('/web3/decode-wallet', {
			method: 'POST',
			body: JSON.stringify({
				encryptionPK: useRoute().query.phantom_encryption_public_key,
				nonce: useRoute().query.nonce,
				payload: useRoute().query.data,
			}),
		});

		payloadData.value = data.value.data;

		return data.value.data;
	};

	// redirect on mounted
	onMounted(async () => {
		await decodeWalletPayload();

		document.location.href = 'https://t.me/lunadebugbot/blinks?startapp=' + payloadData.value.payload + '-' + useRoute().query.phantom_encryption_public_key;
	});
</script>

<!--suppress SassScssResolvedByNameOnly -->
<style lang="sass" scoped>

</style>
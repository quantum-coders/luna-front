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
				payload: useRoute().query.data,
				nonce: useRoute().query.nonce,
			}),
		});

		payloadData.value = data.value.data;

		return data.value.data;
	};

	// redirect on mounted
	onMounted(async () => {
		await decodeWalletPayload();
	});
</script>

<!--suppress SassScssResolvedByNameOnly -->
<style lang="sass" scoped>

</style>
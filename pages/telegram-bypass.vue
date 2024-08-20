<template>
	<pre>{{ useRoute().query }}</pre>
	<pre>{{ payloadData }}</pre>
	<pre>{{ startApp }}</pre>
</template>

<script setup>

	const payloadData = ref('');
	const startApp = ref('');

	const decodeWalletPayload = async () => {
		const { data, error } = await useFetch(`${ useRuntimeConfig().public.baseURL }/web3/decode-wallet`, {
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

		startApp.value = atob(useRoute().query.startapp);

		// appStart is a query string, convert it to an object
		const startAppParams = new URLSearchParams(startApp.value);

		const newParams = new URLSearchParams();
		newParams.append('luna-action', startAppParams.get('luna-action'));
		newParams.append('encryption-public-key', useRoute().query.phantom_encryption_public_key);
		newParams.append('public-key', payloadData.value.public_key);
		newParams.append('session', payloadData.value.session);
		const signed = useRoute().query.signed;
		if(!signed) document.location.href = 'https://t.me/lunadebugbot/blinks?startapp=' + btoa(newParams.toString());

	});
</script>

<!--suppress SassScssResolvedByNameOnly -->
<style lang="sass" scoped>

</style>

<template>
	<pre>{{ useRoute().query }}</pre>
	<pre>{{ payloadData }}</pre>
	<pre>{{ startApp }}</pre>
</template>

<script setup>

	const payloadData = ref('');
	const startApp = ref('');

	startApp.value = atob(useRoute().query.startapp);

	const decodeWalletPayload = async () => {

		const startAppParams = new URLSearchParams(startApp.value);
		const epk = startAppParams.get('epk') || useRoute().query.phantom_encryption_public_key;

		const { data, error } = await useFetch(`${ useRuntimeConfig().public.baseURL }/web3/decode-wallet`, {
			method: 'POST',
			body: JSON.stringify({
				encryptionPK: epk,
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

		// appStart is a query string, convert it to an object
		const startAppParams = new URLSearchParams(startApp.value);
		let encryptionPublicKey = useRoute().query.phantom_encryption_public_key;
		const signed = startAppParams.get('signed');

		if(!signed) {

			const newParams = new URLSearchParams();
			newParams.append('luna-action', startAppParams.get('luna-action'));
			newParams.append('encryption-public-key', encryptionPublicKey);
			newParams.append('public-key', payloadData.value.public_key);
			newParams.append('session', payloadData.value.session);

			document.location.href = 'https://t.me/lunadebugbot/blinks?startapp=' + btoa(newParams.toString())

		} else {

			const newParams = new URLSearchParams();
			newParams.append('luna-action', startAppParams.get('luna-action'));
			newParams.append('signature', payloadData.value.signature);

			document.location.href = 'https://t.me/lunadebugbot/blinks?startapp=' + btoa(newParams.toString())
		}
	});
</script>

<!--suppress SassScssResolvedByNameOnly -->
<style lang="sass" scoped>

</style>

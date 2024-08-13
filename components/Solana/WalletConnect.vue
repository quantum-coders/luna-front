<template>
	<wallet-multi-button />
</template>

<script setup>
	import { useWallet, initWallet } from 'solana-wallets-vue';
	import { WalletMultiButton } from 'solana-wallets-vue';

	const solanaStore = useSolanaStore();
	const config = useRuntimeConfig();
	const authStore = useAuthStore();
	initWallet({ autoConnect: true });

	const wallet = computed(() => {
		const { publicKey, sendTransaction } = useWallet();

		if(publicKey && publicKey.value) {
			solanaStore.wallet = publicKey.value.toBase58();
			return publicKey.value.toBase58();
		}

		solanaStore.wallet = null;
		return null;
	});

	watch(wallet, async (currentValue) => {
		if(currentValue) {
			if(localStorage.getItem('accessToken')) {
				return;
			}
			const connectRes = await fetch(`${ config.public.baseURL }/users/authenticate`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					wallet: wallet.value,
					network: 'solana'
				}),
			});

			if(connectRes.ok) {
				const connectData = await connectRes.json();
				// save accessToken to localStorage
				localStorage.setItem('accessToken', connectData.token);
				authStore.user = connectData.data;
			}
		} else {
			localStorage.removeItem('accessToken');
		}
	});
</script>

<style lang="sass" scoped>
</style>

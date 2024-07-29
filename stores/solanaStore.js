import { defineStore } from 'pinia';
import { useWallet } from 'solana-wallets-vue';
import { Connection, Transaction } from '@solana/web3.js';

export const useSolanaStore = defineStore('solanaStore', () => {

	const wallet = ref('');

	const signEncodedTransaction = async (encodedTransaction) => {
		const { Buffer } = await import('buffer');
		let provider;
		if(useWallet().wallet.value.adapter.name.toLowerCase() === 'backpack') {
			provider = window.backpack;
		} else if(useWallet().wallet.value.adapter.name.toLowerCase() === 'solana') {
			provider = window.solana;
		} else if(useWallet().wallet.value.adapter.name.toLowerCase() === 'phantom') {
			provider = window.solana;
		} else if(useWallet().wallet.value.adapter.name.toLowerCase() === 'solflare') {
			provider = window.solflare;
		}
		if(!provider) {
			alert('Wallet not found');
			return;
		}

		console.log("useRuntimeConfig().public.solanaRPC", useRuntimeConfig().public.solanaRPC)

		const connection = new Connection(useRuntimeConfig().public.solanaRPC, 'confirmed');

		let transaction = Transaction.from(Buffer.from(encodedTransaction, 'base64'));
		console.log('Signing tx', transaction);
		const tx = await provider.signAndSendTransaction(transaction);
		console.log('tx', tx);

		const confirmTransaction = await connection.confirmTransaction(tx,
			{
				commitment: 'confirmed',
				skipPreflight: true,
			},
		);

		console.log('Transaction confirmed', confirmTransaction);

		return confirmTransaction;
	};
	return {
		wallet,
		signEncodedTransaction,
	};
});
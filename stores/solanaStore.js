import { defineStore } from 'pinia';
import { useWallet } from 'solana-wallets-vue';
import {
	Connection,
	Transaction,
	PublicKey,
} from '@solana/web3.js';
import { transact } from '@solana-mobile/mobile-wallet-adapter-protocol';
import { toByteArray } from 'base64-js';

const APP_IDENTITY = {
	name: 'Luna AI',
	uri: 'https://lunadefi.ai',
	icon: 'favicon.ico', // Full path resolves to https://yourdapp.com/favicon.ico
};

export const useSolanaStore = defineStore('solanaStore', () => {

	const wallet = ref('');
	const { isMobile } = useDevice();

	const mobileWallet = ref(null);

	// recover SolanaMobileWalletAdapterDefaultAuthorizationCache from local storage
	const cachedMobileWallet = localStorage.getItem('SolanaMobileWalletAdapterDefaultAuthorizationCache');

	if(cachedMobileWallet) {
		mobileWallet.value = JSON.parse(cachedMobileWallet);
	}

	const { successToast, errorToast } = usePrettyToast();

	const mobileConnect = async () => {
		const authorizationResult = await transact(async (wallet) => {
			/* After approval, signing requests are available in the session. */

			return await wallet.authorize({
				identity: APP_IDENTITY,
				chain: 'solana:mainnet',
				sign_in_payload: {
					domain: 'lunadefi.ai',
					statement: 'Sign into Luna AI',
					uri: 'https://lunadefi.ai',
				},
			});
		});

		console.log('authorizationResult', authorizationResult);
		console.log('Connected to: ' + authorizationResult.accounts[0].address);
		mobileWallet.value = authorizationResult;

		const authorizedPubkey = new PublicKey(toByteArray(mobileWallet.value.accounts[0].address));

		wallet.value = authorizedPubkey.toBase58();

		// save in local storage
		localStorage.setItem('solanaMobileWallet', wallet.value);
		localStorage.setItem('SolanaMobileWalletAdapterDefaultAuthorizationCache', JSON.stringify(mobileWallet.value));
	};

	const signEncodedTransaction = async (encodedTransaction) => {
		const { Buffer } = await import('buffer');
		const connection = new Connection(useRuntimeConfig().public.solanaRPC, 'confirmed');
		let provider;

		if(!!isMobile) {
			try {

				await transact(async (wallet) => {

					console.log('wallet', mobileWallet.value.auth_token);

					await wallet.authorize({
						identity: APP_IDENTITY,
						chain: 'solana:mainnet',
						sign_in_payload: {
							domain: 'lunadefi.ai',
							statement: 'Sign into Luna AI',
							uri: 'https://lunadefi.ai',
						},
						auth_token: mobileWallet.value.auth_token,
					});

					console.log('wallet', wallet);
					console.log('encodedTransaction', encodedTransaction);

					let transaction = Transaction.from(Buffer.from(encodedTransaction, 'base64'));

					console.log('Signing tx', transaction);
					let signedTransaction = await wallet.signTransactions({
						payloads: [ encodedTransaction ],
						skipPreflight: true,
						commitment: 'confirmed',
					});

					const tx = await connection.sendEncodedTransaction(signedTransaction.signed_payloads[0],
						{
							skipPreflight: true,
							preflightCommitment: 'confirmed',
						});
					successToast('Transaction signed');
					return `https://solscan.io/tx/${ signedTransaction }`;
				});
			} catch(e) {
				console.error('Error signing transaction', e);
				errorToast('Error signing transaction: ' + e);
				throw e;
			}
		} else {

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

			console.log('useRuntimeConfig().public.solanaRPC', useRuntimeConfig().public.solanaRPC);

			let transaction = Transaction.from(Buffer.from(encodedTransaction, 'base64'));
			console.log('Signing tx', transaction);
			try {
				const tx = await provider.signAndSendTransaction(transaction);
				console.log('tx', tx);

				const confirmTransaction = await connection.confirmTransaction(tx,
					{
						commitment: 'confirmed',
						skipPreflight: true,
					},
				);
				successToast('Transaction confirmed');
				return `https://solscan.io/tx/${ tx.signature }`;
			} catch(e) {
				console.error('Error signing transaction', e);
				errorToast('Error signing transaction: ' + e);
				throw e;
			}
		}
	};
	return {
		wallet,
		mobileWallet,
		signEncodedTransaction,
		mobileConnect,
	};
});

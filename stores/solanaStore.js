import {defineStore} from 'pinia';
import {useWallet} from "solana-wallets-vue";
import {Connection, Transaction} from "@solana/web3.js";

export const useSolanaStore = defineStore('solanaStore', () => {

    const wallet = ref('');


    const signEncodedTransaction = async (encodedTransaction) => {
        const {Buffer} = await import('buffer');
        let provider;
        if (useWallet().wallet.value.adapter.name.toLowerCase() === 'backpack') {
            provider = window.backpack;
        } else if (useWallet().wallet.value.adapter.name.toLowerCase() === 'solana') {
            provider = window.solana;
        } else if (useWallet().wallet.value.adapter.name.toLowerCase() === 'phantom') {
            provider = window.solana;
        } else if (useWallet().wallet.value.adapter.name.toLowerCase() === 'solflare') {
            provider = window.solflare;
        }
        if (!provider) {
            alert('Wallet not found');
            return;
        }

        const connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');

        let transaction = Transaction.from(Buffer.from(encodedTransaction, 'base64'));
        console.log("Signing tx", transaction)
        const tx = await provider.signAndSendTransaction(transaction);
        return await connection.confirmTransaction(tx,
            {
                commitment: 'confirmed',
                skipPreflight: true,
            },
        );
    }
    return {
        wallet,
        signEncodedTransaction,
    };
});
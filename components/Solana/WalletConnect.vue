<template>
	<wallet-multi-button>
		<template #default="{ wallet, openModal, publicKeyTrimmed, copyAddress, addressCopied, disconnect, publicKeyBase58 }">
			<div
				class="wallet-wrapper d-flex align-items-center gap-2"
				:class="{ 'connected': !!publicKeyBase58.value }"
			>
				<template v-if="!!publicKeyBase58.value">
					<wallet-icon class="wallet-icon" :wallet="wallet" />
					<p class="abbreviated-wallet">{{ publicKeyTrimmed.value }}</p>
					<platform-avatar class="avatar" :user="authStore.user" />
					<div class="profile-menu-wrapper">
						<div class="profile-menu">
							<ul class="list-unstyled">
								<li><a>My account</a></li>
								<li>
									<a href="#" @click.prevent="copyAddress">
										{{ addressCopied.value ? 'Copied' : 'Copy address' }}
									</a>
								</li>
								<li><a href="#" @click.prevent="openModal">Change Wallet</a></li>
								<li><a href="#" @click.prevent="disconnect(); logout()">Disconnect</a></li>

								<slot name="extraActions" />
							</ul>
						</div>
					</div>
				</template>
				<template v-else>
					<slot name="extraActions" />

					<a href="#" @click.prevent="openModal" class="select-wallet">Select a wallet</a>
				</template>
			</div>
		</template>
	</wallet-multi-button>
</template>

<script setup>
	import { useWallet, initWallet, WalletIcon } from 'solana-wallets-vue';
	import { WalletMultiButton } from 'solana-wallets-vue';
	import { useAuth } from '~/composables/useAuth';

	const solanaStore = useSolanaStore();
	const config = useRuntimeConfig();
	const chat = useChatStore();
	const authStore = useAuthStore();
	const { logout } = useAuth();
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
			const connectRes = await fetch(`${ config.public.baseURL }/users/authenticate`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${ localStorage.getItem('accessToken') }`,
				},
				body: JSON.stringify({
					wallet: wallet.value,
					network: 'solana',
				}),
			});

			if(connectRes.ok) {
				const connectData = await connectRes.json();
				// save accessToken to localStorage
				localStorage.setItem('accessToken', connectData.token);
				authStore.user = connectData.data;
				useAuth().setUser(connectData.data);
			}
		} else {
			localStorage.removeItem('accessToken');
		}

		try{
			await chat.fetchUserChats();
		}catch (error) {
			console.error('fetchChats: Error fetching chats:', error);
		}
	});
</script>

<style lang="sass" scoped>

	.wallet-wrapper
		flex-wrap: nowrap
		background: var(--bs-light-bg-subtle)
		border-radius: 100rem

		&:not(.connected)
			padding-left: 0.5rem

		.select-wallet
			white-space: nowrap
			padding: 0.25rem 1rem 0.25rem 0
			margin-bottom: 0
			color: var(--bs-body-color)
			text-decoration: none

		&:hover
			.profile-menu-wrapper
				display: block

		.abbreviated-wallet
			margin-bottom: 0

			font-size: 0.875rem

		.wallet-icon
			width: 1.8rem
			aspect-ratio: 1

			:deep(img)
				width: 100%

		.avatar
			width: 1.8rem

	.profile-menu-wrapper
		display: none
		position: absolute
		z-index: 100
		top: calc(100% - 1px)
		padding-top: 16px
		right: 0

		.profile-menu
			background: var(--bs-light-bg-subtle)
			border-radius: 0 0 0.5rem 0.5rem
			box-shadow: 0 0 0.5rem rgba(0, 0, 0, 0.1)

			ul
				margin-bottom: 0

				li

					a
						padding: 0.5rem 1rem
						display: block
						white-space: nowrap
						text-decoration: none
						color: var(--bs-body-color)

						&:hover
							background: rgba(var(--bs-body-bg-rgb), 0.5)
							color: var(--bs-primary)

</style>

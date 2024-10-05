<template>
	<div class="d-flex flex-column">
		<h6 class="px-3 py-2 mb-0 border-bottom fw-bold">Your Conversations</h6>
		<div class="chat-list-container overflow-y-auto pretty-scrolls">
			<div v-if="chat.userChats.length" ref="chatList">
				<div
					v-for="chat in chat.userChats"
					:key="chat.id"
					@click="goToChat(chat)"
                    class="chat-item list-group-item list-group-item-action d-flex justify-content-between align-items-center p-3"
				>
					<div class="flex-grow-1 overflow-hidden">
						<h6 class="mb-1 text-truncate">{{ chat.title || 'Untitled Conversation' }}</h6>
						<p class="mb-0 text-muted small text-truncate">
							{{ chat.lastMessage?.content || 'Start a new conversation' }}
						</p>
					</div>
					<small class="text-muted ms-2 text-nowrap">{{ formatDate(chat.lastMessage?.created) }}</small>
				</div>
				<div ref="sentinel"></div>
			</div>
		</div>
		<div v-if="chat.userChatLoading" class="d-flex justify-content-center align-items-center py-3">
			<div class="spinner-border" role="status">
				<span class="visually-hidden">Loading...</span>
			</div>
		</div>
	</div>
</template>

<script setup>
	import {useIntersectionObserver} from '@vueuse/core';

	const chat = useChatStore();
	const loading = ref(false);
	const page = ref(1);
	const sentinel = ref(null); // Reference to the sentinel
	const router = useRouter()
	const goToChat = (chat) => {
		router.push('/' + chat.uid);
	};
	// Function to fetch chats
	const fetchChats = async () => {
		if (chat.userChatLoading) {
			console.log('fetchChats: Already loading, avoiding duplicate call.');
			return;
		}
		loading.value = true;
		try {
			console.log('fetchChats: Fetching chats...');
			await chat.fetchUserChats();
		} catch (error) {
			console.error('fetchChats: Error fetching chats:', error);
		} finally {
			console.log('fetchChats: Finished loading chats.');
		}
	};

	// Format Date Function
	const formatDate = (dateString) => {
		if (!dateString) {
			console.log('formatDate: No date provided.');
			return '';
		}
		const date = new Date(dateString);
		const now = new Date();

		let formattedDate = '';
		if (date.toDateString() === now.toDateString()) {
			formattedDate = date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
		} else if (date.getFullYear() === now.getFullYear()) {
			formattedDate = date.toLocaleDateString([], {month: 'short', day: 'numeric'});
		} else {
			formattedDate = date.toLocaleDateString([], {year: 'numeric', month: 'short', day: 'numeric'});
		}
		console.log(`formatDate: Formatting date "${dateString}" to "${formattedDate}"`);
		return formattedDate;
	};

	// Start New Chat Function
	const startNewChat = () => {
		console.log('startNewChat: User initiated a new chat.');
		// Implement the logic to start a new chat here
	};

	// Observe the Sentinel for Infinite Scroll
	const {stop} = useIntersectionObserver(
		sentinel,
		([{isIntersecting}]) => {
			console.log(`IntersectionObserver: isIntersecting = ${isIntersecting}`);
			if (isIntersecting) {
				console.log('IntersectionObserver: Sentinel is visible. Calling fetchChats.');
				fetchChats();
			}
		},
		{threshold: 1.0} // Adjust the threshold as needed
	);

	// Lifecycle Hooks
	onMounted(() => {
		console.log('onMounted: Component mounted. Initiating initial chat load.');
		fetchChats();
	});

	onUnmounted(() => {
		console.log('onUnmounted: Component unmounted. Stopping the observer.');
		stop();
	});
</script>

<style lang="sass" scoped>
	.d-flex.flex-column
		height: 100%

		> div:first-of-type

	.chat-list-container
		flex-grow: 1
		overflow-y: auto
	.chat-item
		cursor: pointer
		&:hover
			background: var(--bs-light-bg-subtle)
			transition: all 0.3s
</style>

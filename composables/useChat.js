import {useChatStore} from "~/stores/chat";

export const useChat = () => {
	const router = useRouter()
	const route = useRoute()
	const uid = ref(null)
	const initializeChat = async () => {

		try {
			if (router.currentRoute.value.params.uid) {
				uid.value = router.currentRoute.value.params.uid
			} else {

				const response = await useBaseFetch('/users/me/chat', {
					method: 'POST',
				})

				console.info("Response from creating chat", response)
				if (!response.data.value.data) {
					console.error('Failed to initialize chat:', response)
					return
				}
				console.info("Response from creating chat", response.data.value.data)
				uid.value = response.data.value.data.uid

				await router.push(`/${uid.value}`)
			}
		} catch (err) {
			console.error('Error initializing chat:', err)
		} finally {
			console.info("UID", uid.value)
		}
	}

	const getChat = async () => {
		const uid = route.params.uid
		if (!uid) {
			console.error('No chat UID available in the route.')
			return
		}

		try {
			const response = await useBaseFetch(`/users/me/chat/${uid}`, {
				method: 'GET',
			})

			console.info("Response from getting chat", response)
			if (!response.data.value.data) {
				console.error('Failed to get chat data:', response)
				return
			}
			useChatStore().setChatData(response.data.value.data)
		} catch (err) {
			console.error('Error getting chat:', err)
			console.error('Failed to get chat data:')
		} finally {
			console.info('Chat data:', useChatStore().chatData.value)
		}
	}

	const getChatHistory = async (limit = 10, offset = 0) => {
		const route = useRoute(); // Hook para acceder a los parámetros de la ruta
		const uid = route.params.uid;
		/// dispatch using chatStore.messageLoading to true
		useChatStore().$patch({ messagesLoading: true });
		if (!uid) {
			useChatStore().$patch({ errorMessages: 'No chat UID available in the route.' });
			useChatStore().$patch({ messagesLoading: false });
			return {chatData: null, error: 'Failed to get chat history. Please try again.'};
		}


		try {
			const response = await useBaseFetch(`/users/me/chat/${uid}/history`, {
				method: 'GET',
				params: {
					limit,
					offset,
				},
			});

			console.info("Response from getting chat history", response);

			if (!response.data.value) {
				useChatStore().$patch({ errorMessages: 'Failed to get chat history. Please try again.' });
				return {chatData: null, error: 'Failed to get chat history. Please try again.'};
			}

			useChatStore().$patch({ messages: response.data.value.data || [] });

			return {chatData: response.data.value, error: null};
		} catch (err) {
			console.error('Error getting chat history:', err);
			useChatStore().$patch({ errorMessages: 'Failed to get chat history. Please try again.' });
			useChatStore().$patch({ messagesLoading: false });
			return {chatData: null, error: 'Failed to get chat history. Please try again.'};
		} finally {
			useChatStore().$patch({ messagesLoading: false });
		}
	};

	return {
		uid,
		initializeChat,
		getChat,
		getChatHistory,
	}
}

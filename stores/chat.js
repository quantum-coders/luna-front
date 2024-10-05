import {defineStore} from 'pinia';
import {v4 as uuidv4} from 'uuid';

export const useChatStore = defineStore('chat', () => {

	const messages = ref([]);
	const wisMessage = ref(null);
	const chatData = ref(null);
	const messagesLoading = ref(false);
	const errorMessages = ref(null);
	const userChats = ref([]);
	const userChatPage = ref(1);
	const userChatLoading = ref(false);
	const fetchUserChats = async () => {
		try {
			userChatLoading.value = true;
			const response = await useBaseFetch(`/users/me/chats?page=${userChatPage.value}&pageSize=5`);
			console.log('fetchChats: Response received', response);
			if (!response.data.value.data) {
				throw new Error('Failed to fetch chats');
			}
			const data = response.data.value.data;
			if (data.length === 0) {
				console.log('fetchChats: No more chats to load. Stopping the observer.');
				stop(); // Stop the observer
			} else {
				console.log(`fetchChats: Loading ${data.length} chats.`);
				userChats.value.push(...data);
				userChatPage.value++;
			}
		} catch (error) {
			console.error('fetchChats: Error fetching chats:', error);
		} finally {
			userChatLoading.value = false;
			console.log('fetchChats: Finished loading chats.');
		}
	}
	const setUserChats = (data) => {
		userChats.value = data;
	}

	const cleanUserChats = () => {
		userChats.value = [];
		userChatPage.value = 1;
	}
	const setChatData = (data) => {
		chatData.value = data;
	}
	const cleanChatData = () => {
		chatData.value = null;
		messages.value = [];
	}
	const addMessage = async (message, createChat = false) => {

		if (createChat) message.uidChat = await useChat().initializeChat();

		// Add a unique ID to the message
		message.uid = uuidv4();

		// Add timestamp to the message
		message.timestamp = new Date().toISOString();
		message.audioLoading = false;

		messages.value.push(message);

		return message;
	};

	const scrollToBottom = () => {
		// scroll to the bottom of #thread, animated
		const thread = document.getElementById('thread');
		if (!thread) return;
		thread.scrollTo({top: thread.scrollHeight, behavior: 'smooth'});
	};

	const sendMessage = async (message, uidChat) => {

		if (!uidChat) {
			throw new Error('uidChat is required');
			return;
		}
		// Create a message for assistant
		const assistantMessage = await addMessage({role: 'assistant', text: '', loading: true, variants: []});

		// Scroll to the bottom of the thread
		scrollToBottom();
		const token = localStorage.getItem('accessToken');
		console.info("---------------->User Token:", token);

		/// consoel info the body request

		console.info("Request body", {
			model: 'gpt-4',
			prompt: message.text,
			uidChat,
			uidMessage: message.uid,
			uidMessageAssistant: assistantMessage.uid,
			properties: {
				wallet: useSolanaStore().wallet,
			},
		});

		const res = await $fetch(`${useRuntimeConfig().public.baseURL}/ai/message/rim`, {
			method: 'POST',
			body: {
				model: 'gpt-4',
				prompt: message.text,
				uidChat,
				uidMessage: message.uid,
				uidMessageAssistant: assistantMessage.uid,
				properties: {
					wallet: useSolanaStore().wallet,
				},
			},
			// add authorization header
			headers: {
				'Authorization': `Bearer ${token}`,
			},
			responseType: 'stream',
		});

		const reader = res.pipeThrough(new TextDecoderStream()).getReader();

		let buffer = '';

		// Read the chunk of data as we get it
		while (true) {
			const {value, done} = await reader.read();

			if (done) {
				// wait 5 seconds
				await new Promise((resolve) => setTimeout(resolve, 250));
				scrollToBottom();

				break;
			}

			buffer += value;

			// Split the buffer on newlines to process multiple lines of data
			const lines = buffer.split('\n');

			// Keep the last line in the buffer if it's incomplete
			buffer = lines.pop();

			for (let line of lines) {
				line = line.trim();

				if (line.startsWith('data: ')) {
					line = line.substring(6).trim();
				}

				if (line.startsWith('{') && line.endsWith('}')) {
					const index = messages.value.findIndex((m) => m.uid === assistantMessage.uid);
					scrollToBottom();

					try {
						const json = JSON.parse(line);

						if (typeof json.type === 'string' && json.type === 'actionsSolved') {
							continue;
						}

						if (typeof json.type === 'string' && json.type === 'rims') {
							messages.value[index].rims = json.rims;
							continue;
						}

						if (!!json.choices && typeof json.choices[0].delta.content === 'string') {
							messages.value[index].loading = false;
							const value = json.choices[0].delta.content;

							if (index !== -1) {
								if (typeof value !== 'undefined' && value !== 'undefined') {
									messages.value[index].text += value;
								}
							}
						}
					} catch (e) {
						console.error('error parsing json', line, e);
					}
				}
			}
		}
	};

	const generateAudio = async (message) => {
		try {
			const index = messages.value.findIndex((m) => m.uid === message.uid);
			const audioRes = await useFetch(`${useRuntimeConfig().public.baseURL}/ai/text-to-audio`, {
				method: 'POST',
				body: {text: messages.value[index].text, uidMessage: messages.value[index].uid},
			});
			console.info("Audio response", audioRes.data.value);
			messages.value[index].variants.push({
				...audioRes.data.value.data,
			});
			return audioRes.data.value
		}catch (e) {
			console.error('Error generating audio:', e);
		}finally {
			const index = messages.value.findIndex((m) => m.uid === message.uid);
		}
	}


	const openWis = async (messageUid) => {
		wisMessage.value = messages.value.find((m) => m.uid === messageUid);
	};

	const closeWis = () => {
		wisMessage.value = null;
	};

	return {
		messages,
		generateAudio,
		wisMessage,
		addMessage,
		sendMessage,
		setChatData,
		cleanChatData,
		userChatLoading,
		openWis,
		chatData,
		messagesLoading,
		errorMessages,
		closeWis,
		scrollToBottom,
		setUserChats,
		cleanUserChats,
		userChats,
		fetchUserChats
	};
});

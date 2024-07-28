import { defineStore } from 'pinia';
import { v4 as uuidv4 } from 'uuid';

export const useChatStore = defineStore('chat', () => {

	const messages = ref([]);
	const wisMessage = ref(null);

	const addMessage = (message) => {
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
		if(!thread) return;
		thread.scrollTo({ top: thread.scrollHeight, behavior: 'smooth' });
	};

	const sendMessage = async (message) => {

		// Create a message for assistant
		const assistantMessage = addMessage({ role: 'assistant', text: '', loading: true });

		// Scroll to the bottom of the thread
		scrollToBottom();

		const res = await $fetch(`${ useRuntimeConfig().public.baseURL }/ai/message/rim`, {
			method: 'POST',
			body: {
				model: 'gpt-4',
				prompt: message,
				properties: {
					wallet: useSolanaStore().wallet,
				},
			},
			responseType: 'stream',
		});

		const reader = res.pipeThrough(new TextDecoderStream()).getReader();

		let buffer = '';

		// Read the chunk of data as we get it
		while(true) {
			const { value, done } = await reader.read();

			if(done) {
				console.log('Stream complete');

				const index = messages.value.findIndex((m) => m.uid === assistantMessage.uid);

				messages.value[index].audioLoading = true;

				const audioRes = await useFetch(`${ useRuntimeConfig().public.baseURL }/ai/text-to-audio`, {
					method: 'POST',
					body: { text: messages.value[index].text },
				});

				messages.value[index].audio = audioRes.data.value.data;
				messages.value[index].audioLoading = false;

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

			for(let line of lines) {
				line = line.trim();

				if(line.startsWith('data: ')) {
					line = line.substring(6).trim();
				}

				if(line.startsWith('{') && line.endsWith('}')) {
					const index = messages.value.findIndex((m) => m.uid === assistantMessage.uid);
					scrollToBottom();

					try {
						const json = JSON.parse(line);

						if(typeof json.type === 'string' && json.type === 'actionsSolved') {
							continue;
						}

						if(typeof json.type === 'string' && json.type === 'rims') {
							console.log(json);
							messages.value[index].rims = json.rims;
							continue;
						}

						if(!!json.choices && typeof json.choices[0].delta.content === 'string') {
							messages.value[index].loading = false;
							const value = json.choices[0].delta.content;

							if(index !== -1) {
								if(typeof value !== 'undefined' && value !== 'undefined') {
									messages.value[index].text += value;
								}
							}
						}
					} catch(e) {
						console.error('error parsing json', line, e);
					}
				}
			}
		}
	};

	const openWis = async (messageUid) => {
		wisMessage.value = messages.value.find((m) => m.uid === messageUid);
	};

	const closeWis = () => {
		wisMessage.value = null;
	};

	return {
		messages,
		wisMessage,
		addMessage,
		sendMessage,
		openWis,
		closeWis,
		scrollToBottom,
	};
});
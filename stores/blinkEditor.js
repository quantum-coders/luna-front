import { defineStore } from 'pinia';

export const useBlinkEditor = defineStore('blinkEditor', () => {

	const keyNum = ref(0);
	const selectedType = ref('');
	const blink = ref(null);
	const originalBlink = ref(null);

	const customIcon = ref('');
	const originalIcon = ref('');
	const customBackgroundImage = ref('');

	// compute if blink and originalBlink have different icons
	const differentIcons = computed(() => {
		if(!blink.value || !originalBlink.value) return false;
		return blink.value.icon !== originalBlink.value.icon;
	});

	const types = {
		'memo': {
			name: 'Send a Memo',
			description: 'Send sweet, sweet memos to the blockchain.',
		},
		'transfer-sol': {
			name: 'Transfer SOL',
			description: 'Send SOL to your friends and family.',
		},

	};

	return {
		keyNum,
		selectedType,
		types,
		blink,
		originalBlink,
		differentIcons,
		customIcon,
		originalIcon,
		customBackgroundImage
	};
});
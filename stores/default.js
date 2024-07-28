import { defineStore } from 'pinia';

export const useDefaultStore = defineStore('defaultStore', () => {

	const foo = ref('');

	return {
		foo,
	};
});
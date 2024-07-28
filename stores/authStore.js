import { defineStore } from 'pinia';
import { v4 as uuidv4 } from 'uuid';

export const useAuthStore = defineStore('authStore', () => {

	const user = ref('');
	return {
		user,
	};
});
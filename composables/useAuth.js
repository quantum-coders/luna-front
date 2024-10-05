export const useAuth = () => {

	const authUser = useAuthUser();
	const chat = useChatStore();
	const setUser = (user) => {
		if(process.client && user && user.accessToken) localStorage.setItem('accessToken', user.accessToken);
		authUser.value = user;
	};

	const getToken = () => {
		if(process.client) return localStorage.getItem('accessToken');
		return null;
	};

	const login = async ({
		username,
		password,
	}) => {

		const { error, data } = await useBaseFetch('/users/login', {
			method: 'POST',
			body: { username, password },
		});

		if(!error.value) setUser(data.value.data);

		return { error, data };
	};

	const logout = async () => {
		// TODO: Check how to use cookies instead of localStorage
		if(process.client) localStorage.setItem('accessToken', null);

		setUser(false);
		chat.cleanUserChats();
		navigateTo('/');
	};

	const getAuthHeaders = () => {

		const headers = [];

		return headers;
	};

	const restoreSwitched = async () => {

		if(process.client) {

			// Get switchedAuthToken from localStorage
			const switchedAuthToken = localStorage.getItem('switchedAuthToken');

			// If we have switchedAuthToken, set the authToken to switchedAuthToken
			if(!!switchedAuthToken && switchedAuthToken !== 'null') {
				localStorage.setItem('accessToken', switchedAuthToken);

				// remove switchedAuthToken from localStorage
				localStorage.removeItem('switchedAuthToken');
			}
		}
	};

	const me = async (token) => {
		if(!authUser.value) {
			try {
				if(!!token && token !== 'null') {

					const { error, data } = await useBaseFetch('/users/me', {
						method: 'GET',
						// TODO: maybe we dont need to pass this
						headers: [
							['Authorization', `Bearer ${ token }`],
						],
					});

					if(!error.value) setUser(data.value.data);
				}

			} catch(error) {
				console.log(error);
			}
		}

		return authUser;
	};

	return {
		getAuthHeaders,
		login,
		logout,
		me,
		setUser,
		restoreSwitched,
		getToken,
	};
};

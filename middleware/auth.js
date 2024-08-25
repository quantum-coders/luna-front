export default defineNuxtRouteMiddleware(async (to) => {
	const user = useAuthUser();
	if(process.client) {
		const authToken = localStorage.getItem('accessToken');
		if(authToken && authToken.toString() !== 'undefined') {
			const { me } = useAuth();
			await me(authToken);
		}
	}
});

<script setup>
	definePageMeta({layout: 'luna'});
	const user = useAuthUser();

	const userBlinks = ref([]);
	onMounted(async () => {
		await useAuth().me();
		const {data} = await useBaseFetch('/users/me/blinks');
		if (data.value.data) {
			userBlinks.value = data.value.data;
		}
	});

	const deleteLink = (id) => {
		// Implementar lógica de eliminación aquí
	};
</script>

<template>
	<div class="container-fluid py-5">
		<div class="row justify-content-center">
			<div class="col-lg-10">
				<h2 class="mb-4 text-center">My Blinks</h2>
				<div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
					<div v-for="blink in userBlinks" :key="blink.id" class="col">
						<div class="card h-100 shadow-sm">
							<div class="card-body d-flex flex-column">
								<div class="d-flex align-items-center mb-3">
									<img :src="blink.data.icon" alt="Blink icon" class="me-2 rounded" width="40"
										 height="40">
									<h5 class="card-title mb-0">{{ blink.data.title }}</h5>
								</div>
								<p class="card-text flex-grow-1">{{ blink.data.description }}</p>
								<div class="d-flex justify-content-between align-items-center mt-3">
									<div class="btn-group">
										<nuxt-link :to="`/blink?b=${useRuntimeConfig().public.baseURL}/cb-${blink.uid}`" class="btn btn-sm btn-outline-primary">
											<Icon name="mdi:eye" class="me-1"/>
											View
										</nuxt-link>
										<nuxt-link
												   class="btn btn-sm btn-outline-secondary">
											<Icon name="mdi:pencil" class="me-1"/>
											Edit
										</nuxt-link>
									</div>
									<button @click="deleteLink(blink.id)" class="btn btn-sm btn-outline-danger">
										<Icon name="mdi:delete"/>
									</button>
								</div>
							</div>
							<div class="card-footer bg-transparent">
								<small class="text-muted">
									<Icon name="mdi:clock-outline" class="me-1"/>
									Created: {{ new Date(blink.created).toLocaleDateString() }}
								</small>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

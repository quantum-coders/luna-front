<template>
	<div class="card p-4 mx-auto">
		<h5 class="card-title text-start">Nft Configuration</h5>
		<form>
			<div class="row mb-2">
				<div class="col-md-12">
					<label for="name" class="form-label">Name</label>
					<input v-model="metadata.name" type="text" class="form-control form-control-sm" id="name"
						   placeholder="Solana Hackathon Ticket">
				</div>
			</div>
			<div class="row mb-2">
				<div class="col-12">
					<label for="description" class="form-label">Description</label>
					<textarea v-model="metadata.description" class="form-control form-control-sm" id="description"
							  rows="2"
							  placeholder="Ticket for Solana Hackathon, granting access to all sessions"></textarea>
				</div>
			</div>
			<div class="row mb-2">
				<div class="col-12">
					<label for="image" class="form-label">Image</label>
					<platform-file-upload
						ref="imageUploadRef"
						accept="image/jpeg,image/png"
						@update="uploadImage"
						class="icon-upload"
						:is-loading="imageLoading"
					>
						<template #default>
							<p v-if="!metadata.image" class="mb-0 text-center">Drop an image here</p>
							<div v-else class="custom-icon">
								<img class="custom-logo" alt="Uploaded image" :src="metadata.image">
								<a href="#" class="remove" @click.prevent="metadata.image = ''">
									<icon name="material-symbols:delete-forever-rounded"/>
								</a>
							</div>
						</template>
					</platform-file-upload>
				</div>
			</div>
			<div class="row mb-2">
				<div class="col-12">
					<label class="form-label">Attributes</label>
					<div v-for="(attribute, index) in metadata.attributes" :key="index"
						 class="input-group input-group-sm mb-2">
						<input v-model="attribute.trait_type" type="text" class="form-control"
							   placeholder="Trait Type (e.g., Level)">
						<input v-model="attribute.value" type="text" class="form-control"
							   placeholder="Value (e.g., VIP)">
						<button type="button" class="btn btn-outline-danger btn-sm" @click="removeAttribute(index)">
							<icon name="material-symbols:delete-forever-rounded"/>
						</button>
					</div>
					<button type="button" class="btn btn-outline-primary btn-sm" @click="addAttribute">
						<icon name="material-symbols:add-circle-outline"/>
						Add Attribute
					</button>
				</div>
			</div>
		</form>
	</div>
</template>


<script setup>
	const imageUploadRef = ref(null);
	const metadata = ref({
		name: 'Solana Hackathon Ticket',
		description: 'Ticket for Solana Hackathon, granting access to all sessions',
		image: '',
		animation_url: 'https://example.com/ticket-animation.mp4',
		external_url: 'https://example.com',
		attributes: [
			{trait_type: 'Level', value: 'VIP'},
			{trait_type: 'Section', value: 'Main Hall'}
		],
		properties: {
			files: [
				{uri: '', type: '', cdn: false}
			],
			category: 'image'
		}
	});

	const emit = defineEmits(['update-metadata']);
	const imageLoading = ref(false);

	watch(metadata, (newMetadata) => {
		emit('update-metadata', JSON.stringify(newMetadata));
	}, {deep: true});

	const addAttribute = () => {
		metadata.value.attributes.push({trait_type: '', value: ''});
	};

	const removeAttribute = (index) => {
		metadata.value.attributes.splice(index, 1);
	};

	const addFile = () => {
		metadata.value.properties.files.push({uri: '', type: '', cdn: false});
	};

	const removeFile = (index) => {
		metadata.value.properties.files.splice(index, 1);
	};

	const uploadImage = async (files) => {
		imageLoading.value = true;

		if (files.length > 0) {
			const formData = new FormData();
			formData.append('file', files[0]);
			const {data, error} = await useFetch(`${useRuntimeConfig().public.baseURL}/upload`, {
				method: 'POST',
				body: formData,
			});

			imageLoading.value = false;

			metadata.value.image = data.value.data.attachment.metas.location;
		}

		imageLoading.value = false;
	};

	const uploadFile = (files, index) => {
		if (files.length > 0) {
			const file = files[0];
			const fileReader = new FileReader();

			fileReader.onload = () => {
				metadata.value.properties.files[index].uri = fileReader.result;
			};

			fileReader.readAsDataURL(file);
		}
	};
</script>

<style lang="sass">
	.custom-logo
		max-width: 100%
		max-height: 300px
		margin: 0 auto
		display: block

	.remove
		position: absolute
		top: 0
		right: 0

		.icon
			font-size: 1.5rem

		&:hover
			background: rgba(0, 0, 0, 0.5)

</style>

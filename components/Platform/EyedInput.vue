<template>
	<!-- input group with a button with an eye icon -->
	<div class="input-group">
		<input :type="type" class="form-control" v-model="password">
		<button @click="toggleType" class="btn btn-outline-primary" type="button" v-if="type === 'password'">
			<icon name="mdi:eye" />
		</button>
		<button @click="toggleType" class="btn btn-outline-primary" type="button" v-else>
			<icon name="mdi:eye-closed" />
		</button>
	</div>
</template>

<script setup>
	const type = ref('password');

	const emit = defineEmits([ 'update:modelValue' ]);

	// Receive the state from the parent component
	const props = defineProps({
		modelValue: {
			type: String,
			default: '',
		},
	});

	const toggleType = () => {
		if(type.value === 'password') {
			type.value = 'text';
		} else {
			type.value = 'password';
		}
	};

	// computed selectedCustomer with get and set
	const password = computed({
		get: () => props.modelValue,
		set: (value) => {
			emit('update:modelValue', value);
		},
	});

</script>

<!--suppress SassScssResolvedByNameOnly -->
<style lang="sass" scoped>

</style>
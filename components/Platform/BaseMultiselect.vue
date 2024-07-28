<template>
	<vue-multiselect
		v-model="selectedElements"
		id="ajax"
		:label="label"
		track-by="id"
		:options="elements"
		:multiple="multiple"
		:searchable="true"
		:loading="isLoading"
		:options-limit="300"
		:limit="10"
		:max-height="600"
		:placeholder="placeholder"
		:tag-placeholder="tagPlaceholder"
		:show-no-results="false"
		@search-change="asyncFind"
		ref="multiSelect"
		@select="updateElement"
		:taggable="taggable"
		@remove="updateElement"
		@tag="emit('tag', $event)"
		select-label="Selecciona una opción"
	>
		<template #option="props">
			<slot name="options" />
		</template>
		<template #noResult>
			<slot name="noResult">
				No results found
			</slot>
		</template>
		<template #placeholder>
			<slot name="placeholder">
				{{ placeholder }}
			</slot>
		</template>
	</vue-multiselect>
</template>

<script setup>
	import VueMultiselect from 'vue-multiselect';
	import 'vue-multiselect/dist/vue-multiselect.css';

	const selectedElements = ref([]);
	const elements = ref([]);
	const isLoading = ref(false);
	const emit = defineEmits([ 'optionSelected', 'update:modelValue', 'tag' ]);
	const multiSelect = ref(null);

	const addingOption =(searchQuery, id) => {

		console.log(searchQuery, id);
	}

	const { errorToast, successToast } = usePrettyToast();

	// receive the users as a prop
	const props = defineProps({
		modelValue: {
			type: [ Array, Object, Number, String ],
		},
		placeholder: {
			type: String,
			default: 'Select an element...',
		},
		tagPlaceholder: {
			type: String,
			default: 'Press enter to create a tag',
		},
		multiple: {
			type: Boolean,
			default: true,
		},
		entity: {
			type: String,
			required: true,
		},
		queryParams: {
			type: Object,
			default: () => {},
		},
		label: {
			type: String,
			default: '',
		},
		taggable: {
			type: Boolean,
			default: false,
		},
	});

	// Watch for changes in query params
	watch(() => props.queryParams, async () => {
		isLoading.value = true;
		await getBase();
		isLoading.value = false;
	});

	watch(() => props.modelValue, async () => {
		if(!props.multiple) selectedElements.value = props.modelValue;
		else {
			if(props.modelValue) {
				await nextTick();
				selectedElements.value.push(props.modelValue);
			} else selectedElements.value = [];
		}
	});

	onMounted(async () => {

		isLoading.value = true;

		if(!props.multiple) selectedElements.value = props.modelValue;
		else {
			if(props.modelValue) {
				await nextTick();
				selectedElements.value.push(props.modelValue);
			} else selectedElements.value = [];
		}

		await getBase();

		if(typeof props.modelValue === 'string' || typeof props.modelValue === 'number') {

			// Search for the id in the elements
			const found = elements.value.find((element) => parseInt(element.id) === parseInt(props.modelValue));

			emit('update:modelValue', found);

			// if the element is found, update the selected elements
			if(found) selectedElements.value = found;
		}

		isLoading.value = false;
	});

	const getBase = async () => {

		const params = {
			...props.queryParams,
		};

		const {
			data,
			error,
		} = await useBaseFetch(`/${ props.entity }?${ new URLSearchParams(params) }`, { method: 'GET' });
		if(error.value) {
			console.log('WAX');
			//errorToast(error.value);
		}
		if(data.value) {
			elements.value = data.value.data;
		}
	};

	const asyncFind = async (query) => {

		// check if the query its already in the elements
		const found = elements.value.find((element) => element.name.toLowerCase() === query.toLowerCase());

		// if the query is already in the elements, return
		if(found) return;

		isLoading.value = true;

		const params = {
			...props.queryParams,
			q: query,
		};

		const { data, error } = await useBaseFetch(`/${ props.entity }?${ new URLSearchParams(params) }`, {
			method: 'GET',
		});
		if(error.value) {
			//errorToast(error.value);
		}
		else if(data.value) {
			// append the new elements to the existing ones
			const found = [ ...elements.value, ...data.value.data ];
			// remove the duplicates, by id
			const unique = [ ...new Map(found.map((item) => [ item.id, item ])).values() ];
			elements.value = unique;
		}
		isLoading.value = false;

	};

	const clearAll = () => {
		selectedElements.value = [];
	};

	const updateElement = (element) => {
		emit('optionSelected', element);
		emit('update:modelValue', selectedElements.value);
	};

	defineExpose({
		getBase
	});

</script>
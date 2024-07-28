<template>
	<div class="data-table d-flex flex-column flex-grow-1">
		<div class="data-table-actions mb-3">
			<div class="col-search">
				<form @submit.prevent="search">
					<div class="input-group">
						<input
							type="text"
							class="form-control"
							:placeholder="dictionary.search"
							v-model="searchQuery"
						>
						<button
							type="reset"
							class="btn btn-clear"
							v-if="searchQuery"
							@click="clearSearch"
						>
							<icon name="line-md:close-small" />
						</button>
						<button class="btn btn-primary" type="submit">
							<icon name="material-symbols:search" />
							{{ dictionary.search }}
						</button>
					</div>
				</form>
			</div>
			<div class="col-other-actions">
				<slot name="meta-actions" />
			</div>
		</div>

		<div class="data-table-scroll flex-grow-1 mb-3" ref="dataTableWrapper">
			<loading
				:active="!!isLoading"
				:is-full-page="false"
			/>

			<div
				class="data-table-wrapper flex-grow-1"
				:class="{ 'd-flex': !items.length }"
			>
				<table
					class="table mb-0"
					ref="dataTable"
					:class="{ 'd-flex flex-column flex-grow-1': !items.length }"
				>
					<thead

						:class="{ 'd-inline-table': !items.length }"
					>
						<tr>
							<th class="checkbox-header text-center" v-if="props.checkboxes">
								<input
									ref="checkAllCheckbox"
									type="checkbox"
									@input="checkAll"
								/>
							</th>
							<th
								ref="cols"
								v-for="field in props.fields"
								:key="field.value"
								:style="field.width ? `width: ${ field.width }px` : {}"
							>
								<div
									class="th-wrapper"
									:class="{
										'no-sort': field.sort === false || typeof field.sort === 'undefined'
									}"
									@click="sort(field)"
								>
									<span>{{ field.text }}</span>
									<a
										href="#"
										class="sort-icon"
										v-if="!!field.sort"
									>
										<icon
											name="carbon:caret-sort"
											v-if="!props.sort.field || props.sort.field !== field.value"
										/>
										<icon
											name="carbon:caret-sort-up"
											v-else-if="props.sort.field === field.value && props.sort.order === 'asc'"
										/>
										<icon name="carbon:caret-sort-down" v-else />
									</a>
								</div>
							</th>
						</tr>
					</thead>

					<tbody
						v-if="!items.length"
						class="d-flex flex-grow-1 align-items-center justify-content-center flex-column"
					>
						<div class="empty-wrapper">
							<slot name="empty-results">
								<icon name="iconoir:glass-empty" />
							</slot>
							<p>{{ getDictionary('notFound') }}</p>
						</div>
					</tbody>

					<tbody v-else>
						<tr v-for="item in items" :key="item.id">
							<td class="text-center" v-if="props.checkboxes">
								<input
									type="checkbox"
									@input="check(item.id)"
									:checked="checkedRows.includes(item.id)"
								/>
							</td>
							<!-- get the fields from the props -->
							<td
								v-for="field in props.fields"
								:key="field.value"
								:class="field.class ?? ''"
							>
								<!-- dynamic slot -->
								<slot :name="field.value" :item="item">
									{{ resolveProp(item, field.value) }}
								</slot>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>

		<div class="d-flex align-items-center justify-content-between">
			<!-- showing item from 1 to x of y items -->
			<p class="mb-0">
				{{ getDictionary('showing') }}
				{{ (currentPage - 1) * perPage + 1 }}
				{{ getDictionary('to') }}
				{{ (currentPage - 1) * perPage + items.length }}
				{{ getDictionary('of') }}
				{{ totalItems }}
				{{ getDictionary('items') }}
			</p>

			<div
				class="data-table-controls d-flex align-items-center gap-2"
				:class="{ 'is-disabled': isLoading }"
			>
				<nav class="ms-auto">
					<vue-awesome-paginate
						v-if="totalItems > perPage"
						class="mb-0"
						pagination-container-class="pag pagination"
						paginate-buttons-class="page-link"
						active-page-class="active"
						:total-items="totalItems"
						:items-per-page="parseInt(perPage)"
						:max-pages-shown="5"
						v-model="currentPage"
						@click="changePage"
					>
						<template #prev-button>
							{{ getDictionary('previous') }}
						</template>
						<template #next-button>
							{{ getDictionary('next') }}
						</template>
					</vue-awesome-paginate>
				</nav>

				<!-- select number of elements -->
				<select class="form-select flex-grow-0 w-auto" v-model="perPage">
					<option value="5">5</option>
					<option value="10">10</option>
					<option value="25">25</option>
				</select>
			</div>
		</div>
	</div>
</template>

<script setup>
	import { VueAwesomePaginate } from 'vue-awesome-paginate';
	import Loading from 'vue3-loading-overlay';
	import 'vue3-loading-overlay/dist/vue3-loading-overlay.css';
	const el = ref(null);

	// function to resolve the element from item
	const resolveProp = function(item, val) {
		// first, we check if we don't have a key of type "foo.bar.baz"
		if(!val.includes('.')) return item[val];

		// if we have a key of type "foo.bar.baz", we need to resolve it, but we can have multiple levels
		// so we need to split the string by the dot
		const keys = val.split('.');

		// now we iterate the keys and resolve the value
		let value = item;
		keys.forEach((key) => {
			value = value[key];
		});

		return value;
	};

	let isLoading = ref(true);
	let dataTableWrapper = ref(null);
	let checkAllCheckbox = ref(null);

	const items = ref([]);
	const pages = ref(0);
	const totalItems = ref(0);
	const dataTable = ref(null);
	const cols = ref([]);
	const currentPage = ref(1);
	const checkedRows = ref([]);
	const searchQuery = ref('');

	const baseDictionary = {
		search: 'Search',
		previous: 'Previous',
		next: 'Next',
		notFound: 'Oppsy Daisy, such empty',
		showing: 'Showing',
		to: 'to',
		of: 'of',
		items: 'items',
	};

	// function to get the dictionary word from props, if not found, use the baseDictionary
	const getDictionary = function(word) {
		return props.dictionary[word] ?? baseDictionary[word];
	};

	const props = defineProps({
		endpoint: {
			type: String,
			required: true,
		},
		fields: {
			type: Array,
			default: () => [],
		},
		page: {
			type: Number,
			default: 1,
		},
		checkboxes: {
			type: Boolean,
			default: false,
		},
		sort: {
			type: Object,
			default: () => ({
				field: 'id',
				order: 'asc',
			}),
		},
		dictionary: {
			type: Object,
			default: () => ({
				search: 'Search',
				previous: 'Previous',
				next: 'Next',
			}),
		},
	});

	// Check if we have perPage in localStorage, if not set it to 10
	let perPage = ref(localStorage.getItem(`data-table-${ props.endpoint }-perPage`) ?? 10);

	onMounted(() => {
		addResizers();
		currentPage.value = props.page;

		// Get the data from the endpoint
		fetchPage();

		/* Update the width of the fields based on local storage considering it was stored this way:
		localStorage.setItem(`data-table-${ props.endpoint }-${ field.value }-width`, field.width);
		 */

		// Set the width of the fields
		cols.value.forEach((col, index) => {
			const field = props.fields[index];
			const localWidth = localStorage.getItem(`data-table-${ props.endpoint }-${ field.value }-width`);

			console.log(field.value, field, localWidth, field.width);

			if(field.width === 'auto') {
				field.width = 'auto';
			} else if(localWidth) {
				// check if it's a string with px, if so, remove the px and set the width
				if(localWidth.includes('px')) {
					field.width = parseInt(localWidth.replace('px', ''), 10);
				} else {
					field.width = localWidth;
				}
			}
		});

		console.log(cols.value);
	});

	const check = function(id) {
		console.log('check', id);
		if(checkedRows.value.includes(id)) {
			checkedRows.value = checkedRows.value.filter((row) => row !== id);
		} else {
			checkedRows.value.push(id);
		}

		// Set indeterminate state of the checkbox
		const checkbox = dataTable.value.querySelector('thead input[type="checkbox"]');
		if(checkedRows.value.length === items.value.length) {
			checkbox.indeterminate = false;
			checkbox.checked = true;
		} else if(checkedRows.value.length > 0) {
			checkbox.indeterminate = true;
			checkbox.checked = false;
		} else {
			checkbox.indeterminate = false;
			checkbox.checked = false;
		}
	};

	const checkAll = function() {
		// If the checkbox is checked, add all the rows to the checkedRows array
		if(checkAllCheckbox.value.checked) {

			// Add all the items to the array, considering that it may have other ids
			checkedRows.value = [
				...checkedRows.value,
				...items.value.map((item) => item.id).filter((id) => !checkedRows.value.includes(id)),
			];

		} else {

			// Remove all the items from the array, considering that it may have other ids
			checkedRows.value = checkedRows.value.filter((row) => !items.value.map((item) => item.id).includes(row));
		}
	};

	const changePage = function(page) {
		console.log('changePage', page);
		currentPage.value = page;
	};

	// Search ---------------------------------------------------------------------------------------------------------

	const search = function() {
		currentPage.value = 1;
		fetchPage();
	};

	const clearSearch = function() {
		searchQuery.value = '';
		search();
	};

	// Fetch ----------------------------------------------------------------------------------------------------------

	const fetchPage = async function() {

		// Show the loader
		isLoading.value = true;

		const { data, error } = await useBaseFetch(props.endpoint, {
			method: 'GET',
			params: {
				page: currentPage.value,
				limit: perPage.value,
				by: props.sort.field,
				order: props.sort.order,
				q: searchQuery.value,
				refresh: new Date().getTime(),
			},
		});

		// Hide the loader
		isLoading.value = false;

		// Check if there was an error
		if(error.value) {
			console.log('error', error.value);
			return;
		}

		// Check if items is empty
		if(!data.value.data.length) {

			items.value = [];
			pages.value = 0;
			totalItems.value = 0;

			// wait for the next tick to update the resizers height
			await nextTick();

			// Update resizers height
			cols.value.forEach((col) => {
				const resizer = col.querySelector('.resizer');
				resizer.style.height = `${ dataTable.value.offsetHeight }px`;
			});

			return;
		}

		items.value = data.value.data;
		pages.value = data.value.pages;
		totalItems.value = data.value.count;

		// Check if the current page is greater than the total pages, if so, set it to the last page
		if(currentPage.value > data.value.pages) currentPage.value = data.value.pages;

		// wait for the next tick to update the resizers height
		await nextTick();

		// wait 3 seconds to update the resizers height
		await new Promise((resolve) => setTimeout(resolve, 500));

		// Update resizers height
		cols.value.forEach((col) => {
			const resizer = col.querySelector('.resizer');

			if(!resizer) return;

			if(dataTable.value && dataTable.value.clientHeight) {
				resizer.style.height = `${ dataTable.value?.clientHeight }px`;
			}
		});
	};

	// Watch ----------------------------------------------------------------------------------------------------------

	watch(perPage, async () => {
		await fetchPage();
		// Save selection in local storage
		localStorage.setItem(`data-table-${ props.endpoint }-perPage`, perPage.value);
	});

	watch(currentPage, async () => {
		await fetchPage();

		// Check if the checkedRows array contains any of the new items
		const newCheckedRows = [];
		items.value.forEach((item) => {
			if(checkedRows.value.includes(item.id)) newCheckedRows.push(item.id);
		});

		// If new checked rows has items, this means that the checkAllCheckbox should be indeterminate
		// If new checked rows is empty, this means that the checkAllCheckbox should be unchecked
		// If new checked rows has the same length as the items, this means that the checkAllCheckbox should be checked
		if(newCheckedRows.length === items.value.length) {
			checkAllCheckbox.value.indeterminate = false;
			checkAllCheckbox.value.checked = true;
		} else if(newCheckedRows.length > 0) {
			checkAllCheckbox.value.indeterminate = true;
			checkAllCheckbox.value.checked = false;
		} else if(newCheckedRows.length === 0) {
			checkAllCheckbox.value.indeterminate = false;
			checkAllCheckbox.value.checked = false;
		}
	});

	// Sort -----------------------------------------------------------------------------------------------------------

	const sort = function(column) {

		// If the column is not sortable, return, this means that sort is false or there is no value
		if(
			column.sort === false ||
			typeof column.sort === 'undefined'
		) return;

		props.sort.field = column.value;

		// If the column is already sorted, reverse the order
		if(props.sort.field === column.value) {
			props.sort.order = props.sort.order === 'asc' ? 'desc' : 'asc';
		} else {
			props.sort.order = 'asc';
		}

		// Reset the current page
		currentPage.value = 1;

		// Fetch the new page
		fetchPage();
	};

	// Resize ---------------------------------------------------------------------------------------------------------

	const addResizers = function() {
		// Iterate cols and add resizer
		cols.value.forEach((col, i) => {
			// get field
			const field = props.fields[i];

			const resizer = document.createElement('div');

			resizer.classList.add('resizer');

			// If we have field.resizable set to false, add class to disable resizing
			if(field.resizable === false || field.width === 'auto') {
				resizer.classList.add('disabled');
			}

			resizer.style.height = `${ dataTable.value.offsetHeight }px`;
			//resizer.addEventListener('mousedown', initResize, false);
			col.appendChild(resizer);

			createResizableColumn(col, resizer, i);
		});
	};

	const createResizableColumn = function(col, resizer, index) {
		// Track the current position of mouse
		let x = 0;
		let w = 0;

		const resizeMouseDownHandler = function(e) {

			// Get the current mouse position
			x = e.clientX;

			// Calculate the current width of column
			const styles = window.getComputedStyle(col);
			w = parseInt(styles.width, 10);

			// Attach listeners for document's events
			document.addEventListener('mousemove', resizeMouseMoveHandler);
			document.addEventListener('mouseup', resizeMouseUpHandler);

			resizer.classList.add('resizing');
		};

		const resizeMouseMoveHandler = function(e) {
			// Determine how far the mouse has been moved
			const dx = e.clientX - x;

			// Get the field based on the index
			const field = props.fields[index];

			// if there is no minWidth, default to 50px
			if(!field.minWidth) field.minWidth = 50;

			// If we have a min width or a max width from the field, cap the resize
			if(field.minWidth && field.maxWidth) {
				// Update the width of column, minimum 100px
				col.style.width = `${ Math.min(Math.max(w + dx, field.minWidth), field.maxWidth) }px`;
			} else if(field.maxWidth) {
				// Update the width of column, minimum 100px
				col.style.width = `${ Math.min(w + dx, field.maxWidth) }px`;
			} else if(field.minWidth) {
				// Update the width of column, minimum 100px
				col.style.width = `${ Math.max(w + dx, field.minWidth) }px`;
			} else {
				// Update the width of column, minimum 100px
				col.style.width = `${ w + dx }px`;
			}

			// Update the width in the field
			field.width = col.style.width;

			// Save the width in local storage, so we can retrieve it later
			localStorage.setItem(`data-table-${ props.endpoint }-${ field.value }-width`, field.width);
		};

		// When user releases the mouse, remove the existing event listeners
		const resizeMouseUpHandler = function() {
			document.removeEventListener('mousemove', resizeMouseMoveHandler);
			document.removeEventListener('mouseup', resizeMouseUpHandler);

			resizer.classList.remove('resizing');
		};

		resizer.addEventListener('mousedown', resizeMouseDownHandler);
	};

	// Refresh table --------------------------------------------------------------------------------------------------
	const refreshTable = function() {
		currentPage.value = 1;
		fetchPage();
	};

	const setLoading = function() {
		isLoading.value = true;
	};

	defineExpose({
		refreshTable,
		setLoading,
	});

</script>

<!--suppress SassScssResolvedByNameOnly -->
<style lang="sass">
	.pagination
		li
			&:first-child
				.page-link
					border-top-left-radius: var(--bs-pagination-border-radius)
					border-bottom-left-radius: var(--bs-pagination-border-radius)

			&:not(:first-child)
				.page-link
					margin-left: -1px

			&:last-child
				.page-link
					border-top-right-radius: var(--bs-pagination-border-radius)
					border-bottom-right-radius: var(--bs-pagination-border-radius)
</style>

<style lang="sass" scoped>

	.data-table
		container-type: inline-size

	.data-table-actions
		display: flex
		flex-direction: column
		gap: 1rem
		margin-bottom: 1rem

		@container (min-width: #{$md})
			flex-direction: row
			justify-content: space-between
			align-items: center

	.col-search
		width: 100%

		@container (min-width: #{$md})
			width: 380px

	.col-other-actions
		flex: 1

	.d-inline-table
		display: inline-table

	.checkbox-header
		width: 40px

		input
			top: 2px

	:deep(.resizing)
		background: var(--bs-gray-300)

	.data-table-wrapper
		position: absolute
		height: 100%
		width: 100%
		overflow: auto

		// Add pretty scrollbar
		@extend .pretty-scrolls

	.table
		position: relative
		border-collapse: collapse
		background: var(--bs-white)
		table-layout: fixed

		:deep(td)
			padding: 0.5rem
			border-bottom: 1px solid var(--bs-gray-300)
			white-space: nowrap
			text-overflow: ellipsis
			overflow: hidden
			vertical-align: middle

		:deep(th)
			position: sticky
			top: 0
			z-index: 100
			background: var(--bs-white)
			font-size: 0.65rem
			white-space: nowrap
			text-overflow: ellipsis
			text-transform: uppercase
			//Disable text selection
			user-select: none

			&:not(.checkbox-header)
				min-width: 100px

			.th-wrapper
				position: relative
				cursor: pointer
				inset: 0
				display: flex
				align-items: center
				width: 100%
				justify-content: space-between

				&.no-sort
					cursor: default

			// Add a after with a border bottom
			&::after
				content: ''
				position: absolute
				bottom: 0
				left: 0
				width: 100%
				height: 1px
				background: var(--bs-gray-300)

			span
				text-overflow: ellipsis
				overflow: hidden
				display: block

		:deep(.resizer)
			position: absolute
			top: 0
			right: 0
			width: 5px
			cursor: col-resize
			user-select: none

			&.disabled
				pointer-events: none

			&:hover
				background: var(--bs-gray-300)

		// Last column resizer cannot be dragged
		:deep(th:last-child .resizer)
			display: none

	.data-table-controls
		&.is-disabled
			pointer-events: none
			opacity: 0.5

	.btn-clear
		background: white
		border-top: 1px solid #ced4da
		border-bottom: 1px solid #ced4da

	.empty-wrapper
		display: flex
		flex-direction: column
		width: 200px
		aspect-ratio: 1
		justify-content: center
		align-items: center
		background: var(--bs-light-bg-subtle)
		border-radius: 50%
		margin-bottom: 1rem

		& > *
			background: transparent

		.icon
			font-size: 4rem
			padding: 0
			fill: red !important

		p
			width: 80%
			margin: 0 auto
			text-align: center

		img
			width: 50%
</style>
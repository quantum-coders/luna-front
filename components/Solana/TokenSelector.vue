<template>
	<div class="d-flex flex-column flex-grow-1" ref="dropdownRef">
		<label for="token-search" class="form-label">Search or select a token</label>
		<div class="input-group mb-3">
      <span v-if="selectedToken" class="input-group-text">
        <img :src="selectedToken.logoURI" :alt="`${selectedToken.name} logo`" class="rounded-circle p-1 custom-img"/>
      </span>
			<input
				id="token-search"
				v-model="searchQuery"
				type="text"
				class="form-control"
				:placeholder="selectedToken ? selectedToken.symbol : placeholder"
				@focus="openDropdown"
				@click="openDropdown"
				@input="handleSearch"
			/>
			<button
				v-if="selectedToken"
				class="btn btn-outline-secondary"
				type="button"
				@click="clearSelection"
				aria-label="Clear selection"
			>
				<icon name="material-symbols:close"/>
			</button>
		</div>
		<div v-if="isDropdownOpen" class="custom-position dropdown-menu show w-100 pretty-scrolls"
			 style="max-height: 300px; overflow-y: auto;" @scroll="handleScroll">
			<ul class="list-group list-group-flush custom-list">
				<li
					v-for="token in displayedTokens"
					:key="token.address"
					class="list-group-item list-group-item-action d-flex align-items-center"
					@click="onTokenSelect(token)"
				>
					<img
						:src="token.logoURI"
						:alt="`${token.name} logo`"
						class="rounded-circle me-2"
						width="24"
						height="24"
					/>
					<span>{{ token.name }} ({{ token.symbol }})</span>
				</li>
			</ul>
			<div v-if="isLoading" class="text-center py-3">
				<div class="spinner-border text-primary" role="status">
					<span class="visually-hidden">Loading...</span>
				</div>
			</div>
			<p v-else-if="filteredTokens.length === 0" class="text-muted text-center py-3">
				No tokens found
			</p>
		</div>
	</div>
</template>

<script setup>
	import {ref, computed, onMounted, onUnmounted, defineProps, defineEmits} from 'vue'

	// Definir las propiedades que el componente acepta
	const props = defineProps({
		modelValue: {
			type: String, // Ahora es el address, una cadena
			default: null,
		},
		placeholder: {
			type: String,
			default: 'Search a token...',
		},
	})

	// Definir los eventos que el componente emitirá
	const emit = defineEmits(['update:modelValue'])

	const tokensList = ref([])
	const searchQuery = ref('')
	const isDropdownOpen = ref(false)
	const dropdownRef = ref(null)
	const isLoading = ref(false)
	const imageCache = new Map()
	const itemsPerPage = 20
	const currentPage = ref(1)

	// Computed para encontrar el token seleccionado basado en modelValue (address)
	const selectedToken = computed(() => {
		if (!props.modelValue) return null
		return tokensList.value.find(token => token.address === props.modelValue) || null
	})

	// Función para obtener la lista de tokens desde la API
	const getTokenList = async () => {
		try {
			isLoading.value = true
			const response = await fetch(`${useRuntimeConfig().public.baseURL}/tokens`)
			if (!response.ok) {
				throw new Error('Failed to fetch token list')
			}
			const tokenListData = await response.json()
			tokensList.value = tokenListData.data
			preloadImages()
		} catch (error) {
			console.error(error)
		} finally {
			isLoading.value = false
		}
	}

	// Función para precargar imágenes y mejorar el rendimiento
	const preloadImages = () => {
		tokensList.value.forEach(token => {
			if (!imageCache.has(token.logoURI)) {
				const img = new Image()
				img.src = token.logoURI
				imageCache.set(token.logoURI, img)
			}
		})
	}

	// Manejar el montaje del componente
	onMounted(async () => {
		await getTokenList()
		document.addEventListener('click', handleClickOutside)
	})

	// Limpiar el evento al desmontar el componente
	onUnmounted(() => {
		document.removeEventListener('click', handleClickOutside)
	})

	// Computed para filtrar los tokens según la búsqueda
	const filteredTokens = computed(() => {
		const query = searchQuery.value.toLowerCase()
		return tokensList.value.filter(token =>
			token.name.toLowerCase().includes(query) ||
			token.symbol.toLowerCase().includes(query)
		)
	})

	// Computed para manejar la paginación de tokens mostrados
	const displayedTokens = computed(() => {
		return filteredTokens.value.slice(0, currentPage.value * itemsPerPage)
	})

	// Función para seleccionar un token
	const onTokenSelect = (token) => {
		emit('update:modelValue', token.address) // Emitir solo la dirección
		searchQuery.value = ''
		isDropdownOpen.value = false
	}

	// Función para cerrar el dropdown al hacer clic fuera
	const handleClickOutside = (event) => {
		if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
			isDropdownOpen.value = false
		}
	}

	// Función para abrir el dropdown
	const openDropdown = () => {
		isDropdownOpen.value = true
		currentPage.value = 1
	}

	// Función para limpiar la selección del token
	const clearSelection = () => {
		emit('update:modelValue', null) // Emitir null para limpiar la selección
		searchQuery.value = ''
		openDropdown()
	}

	// Función para manejar la búsqueda de tokens
	const handleSearch = () => {
		currentPage.value = 1
		emit('update:modelValue', null) // Emitir null para limpiar la selección al buscar
		openDropdown()
	}

	// Función para manejar el scroll y cargar más tokens si es necesario
	const handleScroll = (event) => {
		const {scrollTop, scrollHeight, clientHeight} = event.target
		if (scrollTop + clientHeight >= scrollHeight - 20 && !isLoading.value && displayedTokens.value.length < filteredTokens.value.length) {
			currentPage.value++
		}
	}
</script>

<style lang="sass" scoped>
	.custom-position
		position: absolute
		top: 100%
		left: 0
		right: 0

	.custom-list
		max-height: 200px

	.custom-img
		max-height: 24px
</style>

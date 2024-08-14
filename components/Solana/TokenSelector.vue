<script setup>

const tokensList = ref([])
const selectedToken = ref(null)
const searchQuery = ref('')
const isDropdownOpen = ref(false)
const dropdownRef = ref(null)
const isLoading = ref(false)
const imageCache = new Map()
const currentPage = ref(1)
const itemsPerPage = 10
const allItemsLoaded = ref(false)

const emit = defineEmits(['update:selectedToken'])

const getTokenList = async () => {
  try {
    isLoading.value = true
    const tokenList = await fetch(`${useRuntimeConfig().public.baseURL}/tokens`)
    if (!tokenList.ok) {
      throw new Error('Failed to fetch token list')
    }
    const tokenListData = await tokenList.json()
    tokensList.value = tokenListData.data
    preloadImages()
  } catch (error) {
    console.error(error)
  } finally {
    isLoading.value = false
  }
}

const preloadImages = () => {
  const tokensToPreload = tokensList.value.slice(0, itemsPerPage * currentPage.value)
  tokensToPreload.forEach(token => {
    if (!imageCache.has(token.logoURI)) {
      const img = new Image()
      img.src = token.logoURI
      imageCache.set(token.logoURI, img)
    }
  })
}

const handleScroll = () => {
  const dropdown = dropdownRef.value
  if (dropdown && !allItemsLoaded.value) {
    const bottomReached = dropdown.scrollTop + dropdown.clientHeight >= dropdown.scrollHeight - 10
    if (bottomReached) {
      currentPage.value++
      const start = (currentPage.value - 1) * itemsPerPage
      const end = currentPage.value * itemsPerPage
      if (end >= tokensList.value.length) {
        allItemsLoaded.value = true
      }
      preloadImages()
    }
  }
}

onMounted(async () => {
  await getTokenList()
  document.addEventListener('click', handleClickOutside)
  dropdownRef.value.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  if (dropdownRef.value) {
    dropdownRef.value.removeEventListener('scroll', handleScroll)
  }
})

const filteredTokens = computed(() => {
  const query = searchQuery.value.toLowerCase()
  const filtered = tokensList.value
    .filter(token =>
      token.name.toLowerCase().includes(query) ||
      token.symbol.toLowerCase().includes(query)
    )
  return filtered.slice(0, itemsPerPage * currentPage.value)
})

const onTokenSelect = (token) => {
  selectedToken.value = token
  searchQuery.value = `${token.name} (${token.symbol})`
  emit('update:selectedToken', token)
  isDropdownOpen.value = false
}

const handleClickOutside = (event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    isDropdownOpen.value = false
  }
}

const openDropdown = () => {
  isDropdownOpen.value = true
}

const clearSelection = () => {
  selectedToken.value = null
  searchQuery.value = ''
  emit('update:selectedToken', null)
}

</script>

<template>
  <div class="token-selector" ref="dropdownRef">
    <label for="token-search" class="form-label">Search or select a token</label>
    <div class="input-group">
      <input
        id="token-search"
        v-model="searchQuery"
        type="text"
        class="form-control"
        :class="{ 'is-invalid': isDropdownOpen && filteredTokens.length === 0 }"
        placeholder="Search a token..."
        @focus="openDropdown"
        @click="openDropdown"
      />
      <button
        v-if="selectedToken"
        class="btn btn-outline-primary"
        type="button"
        @click="clearSelection"
        aria-label="Clear selection"
      >
        <icon name="heroicons-solid:x-circle" />
      </button>
    </div>
    <div v-if="isDropdownOpen" class="dropdown-menu show w-100" style="max-height: 300px; overflow-y: auto;">
      <ul v-if="filteredTokens.length > 0" class="list-group list-group-flush">
        <li
          v-for="token in filteredTokens"
          :key="token.address"
          class="list-group-item list-group-item-action d-flex align-items-center"
          @click="onTokenSelect(token)"
        >
          <img
            :src="token.logoURI"
            :alt="`${token.name} logo`"
            class="rounded-circle me-2"
            style="width: 1.5rem; height: 1.5rem;"
          />
          <span>{{ token.name }} ({{ token.symbol }})</span>
        </li>
      </ul>
      <div v-else-if="isLoading" class="text-center py-3">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
      <p v-else class="text-muted text-center py-3">
        No tokens found
      </p>
    </div>
  </div>
</template>

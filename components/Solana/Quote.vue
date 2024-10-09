<template>
  <div class="flex-grow-1 pb-2">
    <template v-if="quote">
      <div class="d-flex align-items-center">
        <img :src="quote.inputToken.logoURI" :alt="quote.inputToken.symbol" class="rounded-circle me-2" width="30" height="30">
        <span class="fw-bold me-2">{{ quote.inputToken.symbol }}</span>
        <i class="bi bi-arrow-right me-2"></i>
        <img :src="quote.outputToken.logoURI" :alt="quote.outputToken.symbol" class="rounded-circle me-2" width="30" height="30">
        <span class="fw-bold me-2">{{ quote.outputToken.symbol }}</span>
        <span class="text-muted small">{{ getExchangeRate() }}</span>
        <button class="btn btn-sm btn-outline-primary ms-auto" @click="toggleDetails">
          Details
        </button>
      </div>
      <div v-show="showDetails" class="mt-3">
        <div class="card card-body">
          <div class="row g-3">
            <div class="col-md-6">
              <h6 class="fw-bold">{{ quote.inputToken.name }} ({{ quote.inputToken.symbol }})</h6>
              <p class="mb-1 small">Address: {{ truncateAddress(quote.inputToken.address) }}</p>
              <p class="mb-1 small">Daily Volume: ${{ formatNumber(quote.inputToken.dailyVolume) }}</p>
            </div>
            <div class="col-md-6">
              <h6 class="fw-bold">{{ quote.outputToken.name }} ({{ quote.outputToken.symbol }})</h6>
              <p class="mb-1 small">Address: {{ truncateAddress(quote.outputToken.address) }}</p>
              <p class="mb-1 small">Daily Volume: ${{ formatNumber(quote.outputToken.dailyVolume) }}</p>
            </div>
          </div>
        </div>
      </div>
    </template>
    <div v-else class="text-center py-2">
      <div class="spinner-border spinner-border-sm text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

const tokenStore = useTokenStore();
const quote = computed(() => tokenStore.quote);
const showDetails = ref(false);

const truncateAddress = (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`;
const formatNumber = (num: number) => new Intl.NumberFormat('en-US', {maximumFractionDigits: 2}).format(num);
const getExchangeRate = () => {
  const inputPrice = parseFloat(quote.value.quotes[quote.value.inputToken.address].price);
  const outputPrice = parseFloat(quote.value.quotes[quote.value.outputToken.address].price);
  tokenStore.inputPrice = inputPrice;
  tokenStore.outputPrice = outputPrice;
   tokenStore.calculateProfit();
  return `1 ${quote.value.inputToken.symbol} = ${(inputPrice / outputPrice).toFixed(6)} ${quote.value.outputToken.symbol}`;
};

const toggleDetails = () => {
  showDetails.value = !showDetails.value;
};
</script>

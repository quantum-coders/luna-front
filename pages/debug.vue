<template>
  <div class="container">
    <h1>Select a Token</h1>
    <SolanaTokenSelector @update:selectedToken="handleTokenSelected" />
    <div v-if="selectedToken" class="mt-3">
      <p><strong>Selected Token:</strong> {{ selectedToken.name }}</p>
	    <pre>
		    	      {{ selectedToken }}
	    </pre>
    </div>
  </div>
</template>

<script setup>

const selectedToken = ref(null);

const handleTokenSelected = (token) => {
  selectedToken.value = token;
};
</script>

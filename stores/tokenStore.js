import {defineStore} from 'pinia'
import {ref, watch} from 'vue'

export const useTokenStore = defineStore('tokenStore', () => {
	const quoteExecuted = ref(false)
	let debounceTimer = null
	const quote = ref(null)
	const inputToken = ref(null)
	const outputToken = ref(null)
	const inputPrice = ref(null)
	const outputPrice = ref(null)
	const inAmount = ref(0.0)
	const outAmount = ref(0.0)
	const profitPercentage = ref(0.0)

	const getQuote = async (inputMint, outputMint) => {
		// Reset quote obj to null
		quote.value = null
		inputToken.value = null
		outputToken.value = null
		inputPrice.value = null
		outputPrice.value = null
		outAmount.value = 0.0

		if (!inputMint || !outputMint) return
		inputToken.value = inputMint
		outputToken.value = outputMint

		// Clear existing timer
		if (debounceTimer) clearTimeout(debounceTimer)

		// Set up a new timer
		debounceTimer = setTimeout(async () => {
			try {
				const response = await fetch(`${useRuntimeConfig().public.baseURL}/tokens/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${inAmount.value}`)
				if (!response.ok) {
					throw new Error('Failed to fetch token quote')
				}
				quoteExecuted.value = true
				const responseJson = await response.json()
				console.info("Quote response:", responseJson.data)
				quote.value = responseJson.data

				// Update values based on the quote
				inputPrice.value = responseJson.data.inputPrice
				outputPrice.value = responseJson.data.outputPrice
				outAmount.value = responseJson.data.outAmount || responseJson.data.outputAmount // Adjust based on your API response

				calculateProfit()
			} catch (error) {
				console.error('Error fetching quote:', error)
				quoteExecuted.value = false
			}
		}, 300) // 300ms delay
	}

	const resetQuoteExecuted = () => {
		quoteExecuted.value = false
	}

	const calculateProfit = () => {
		console.log('Starting profit calculation...');
		console.log('Input Price:', inputPrice.value);
		console.log('Output Price:', outputPrice.value);
		console.log('Input Amount:', inAmount.value);
		console.log('Output Amount:', outAmount.value);

		if (!inputPrice.value || !outputPrice.value || !inAmount.value || !outAmount.value) {
			console.log('Missing required values. Calculation aborted.');
			return;
		}

		const inputValue = inputPrice.value * inAmount.value;
		const outputValue = outputPrice.value * outAmount.value;

		console.log('Total Input Value:', inputValue);
		console.log('Total Output Value:', outputValue);

		profitPercentage.value = ((outputValue - inputValue) / inputValue) * 100;

		console.log('Calculated Profit Percentage:', profitPercentage.value);
	}
    watch([inAmount, outAmount, inputPrice], () => {
        calculateProfit();
    });

	return {
		getQuote,
		calculateProfit,
		inAmount,
		outAmount,
		profitPercentage,
		inputPrice,
		outputPrice,
		quoteExecuted,
		resetQuoteExecuted,
		quote,
		inputToken,
		outputToken,
	}
})

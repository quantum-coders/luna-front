<template>
	<div class="d-inline-flex pb-1">
		<div class="d-flex flex-column align-items-start">
			<div class="d-flex flex-row gap-1 align-items-baseline">
				<small class="text-muted">Profit</small>
				<span :class="['fw-bold', currentRange.class]" :key="profitPercentage" class="profit-value">
          {{ formattedProfit }}
        </span>
			</div>
			<small :class="['mt-1', currentRange.class]" :key="profitPercentage" class="profit-phrase">
				{{ currentRange.phrase }}
			</small>
		</div>
	</div>
</template>

<script setup lang="ts">
	import {computed} from 'vue'

	const props = defineProps({
		profitPercentage: {
			type: Number,
			required: true,
		},
	})

	// Define a comprehensive list of profit ranges
	const profitRanges = [
		{min: 120, max: Infinity, class: 'text-very-success', phrase: "NGMI? More like WAGMI! 💎🙌"},
		{min: 115, max: 120, class: 'text-extreme-success', phrase: "Up only, baby! 📈💰"},
		{min: 110, max: 115, class: 'text-high-success', phrase: "Bags packed, we're mooning! 🌕🚀"},
		{min: 105, max: 110, class: 'text-great-success', phrase: "Lambo inbound! 🏎️💨"},
		{min: 100, max: 105, class: 'text-superb-success', phrase: "Literally printing money! 🖨️💸"},
		{min: 95, max: 100, class: 'text-strong-success', phrase: "Can't stop, won't stop! 🔥🚀"},
		{min: 90, max: 95, class: 'text-good-success', phrase: "Sending it straight to Valhalla! ⚔️🛡️"},
		{min: 85, max: 90, class: 'text-positive-success', phrase: "When moon? Right now! 🌕💥"},
		{min: 80, max: 85, class: 'text-very-positive-success', phrase: "My portfolio is built different! 💪📊"},
		{min: 75, max: 80, class: 'text-excellent-success', phrase: "Top-tier alpha right here! 🧠💼"},
		{min: 70, max: 75, class: 'text-fantastic-success', phrase: "Gains so good, even your grandma's aping in! 👵💰"},
		{min: 65, max: 70, class: 'text-outstanding-success', phrase: "Straight outta bear market! 🐻➡️🦍"},
		{min: 60, max: 65, class: 'text-super-success', phrase: "Pump it up, DJ! 🎶💸"},
		{min: 55, max: 60, class: 'text-mighty-success', phrase: "Diamond hands paying off! 💎🙌"},
		{min: 50, max: 55, class: 'text-stellar-success', phrase: "Wen Lambo? Soon™ 🚗💨"},
		{min: 45, max: 50, class: 'text-strong-positive', phrase: "DeFi degens eating good tonight! 🍽️📈"},
		{min: 40, max: 45, class: 'text-good-positive', phrase: "Might buy another JPEG with these gains! 🖼️💵"},
		{min: 35, max: 40, class: 'text-positive-positive', phrase: "WAGMI vibes only! ✨🤝"},
		{min: 30, max: 35, class: 'text-decent-success', phrase: "Farming them sweet APYs! 🌽💰"},
		{min: 25, max: 30, class: 'text-satisfactory-success', phrase: "Steady gains, no rug in sight! 🧘‍♂️📊"},
		{min: 20, max: 25, class: 'text-moderate-success', phrase: "Green candles all day! 🟢🕯️"},
		{min: 15, max: 20, class: 'text-fair-success', phrase: "Not bad, but not Lambo either! 🤷‍♂️💸"},
		{min: 10, max: 15, class: 'text-passing-success', phrase: "At least it's not red! 🔴🚫"},
		{min: 5, max: 10, class: 'text-slight-success', phrase: "Gains are gains, right? 🤔📈"},
		{min: 0, max: 5, class: 'text-minimal-success', phrase: "Barely making it, but still WAGMI! ✌️💸"},
		{min: -5, max: 0, class: 'text-minimal-loss', phrase: "Just a dip, nothing to see here! 🕳️🔻"},
		{min: -10, max: -5, class: 'text-slight-loss', phrase: "Wen dip buy? Maybe now! 🐋📉"},
		{min: -15, max: -10, class: 'text-passing-loss', phrase: "It's just a healthy correction! 💉📉"},
		{min: -20, max: -15, class: 'text-fair-loss', phrase: "Could be worse, could be rugging! 😅🚩"},
		{min: -25, max: -20, class: 'text-moderate-loss', phrase: "Market shaking out weak hands! 🖐️🔻"},
		{min: -30, max: -25, class: 'text-satisfactory-loss', phrase: "Who needs money anyway? 🤑📉"},
		{min: -35, max: -30, class: 'text-decent-loss', phrase: "CEX down? Or just my portfolio? 📉🔒"},
		{min: -40, max: -35, class: 'text-positive-loss', phrase: "Holding strong like a true degen! 💪💀"},
		{min: -45, max: -40, class: 'text-good-loss', phrase: "This is fine... everything is fine... 🔥🐕"},
		{min: -50, max: -45, class: 'text-strong-loss', phrase: "More red than the 'sell' button! 🔴🕹️"},
		{min: -55, max: -50, class: 'text-stellar-loss', phrase: "Paper hands reporting for duty! 📜🤲"},
		{min: -60, max: -55, class: 'text-mighty-loss', phrase: "Where did my funds go? Asking for a friend. 🕵️‍♂️📉"},
		{min: -65, max: -60, class: 'text-super-loss', phrase: "More rugged than a bear market! 🧻🚩"},
		{min: -70, max: -65, class: 'text-outstanding-loss', phrase: "Devs? Devs?? We got rugged... 🧑‍💻🚩"},
		{min: -75, max: -70, class: 'text-fantastic-loss', phrase: "Down bad, but still not selling! 🦧🤲"},
		{min: -80, max: -75, class: 'text-excellent-loss', phrase: "Rugged so hard, even Vitalik can't save us. 🧑‍🚀📉"},
		{min: -85, max: -80, class: 'text-very-positive-loss', phrase: "Not rekt, just... financially challenged. 🤑🔻"},
		{min: -90, max: -85, class: 'text-positive-positive-loss', phrase: "At least I still have my memes. 😂📉"},
		{min: -95, max: -90, class: 'text-good-good-loss', phrase: "Hoping for a miracle or just coping? 🤷‍♂️🔻"},
		{min: -100, max: -95, class: 'text-strong-strong-loss', phrase: "Rekt beyond recognition. 💀📉"},
		{min: -105, max: -100, class: 'text-super-super-loss', phrase: "Need a rekt bandage for this one... 🩹📉"},
		{min: -110, max: -105, class: 'text-high-high-loss', phrase: "Not a dip anymore, this is a cliff. 🏞️💥"},
		{min: -115, max: -110, class: 'text-extreme-extreme-loss', phrase: "An epic rug-pull, no survivors. 🚩📉"},
		{min: -120, max: -115, class: 'text-very-extreme-loss', phrase: "Deploy the REKT protocol! 🚨📉"},
		{min: -125, max: -120, class: 'text-catastrophic-loss', phrase: "Liquidated... in more ways than one. 💧📉"},
		{
			min: -Infinity,
			max: -125,
			class: 'text-apocalyptic-loss',
			phrase: "Apocalypse confirmed. Everything's gone. 💀🌋"
		},
	]


	// Function to get the current range based on profitPercentage
	const getCurrentRange = (percentage: number) => {
		return profitRanges.find(range => percentage > range.min && percentage <= range.max) || profitRanges[profitRanges.length - 1]
	}

	const currentRange = computed(() => getCurrentRange(props.profitPercentage))

	const formattedProfit = computed(() => {
		return `${props.profitPercentage > 0 ? '+' : ''}${props.profitPercentage.toFixed(2)}%`
	})
</script>

<style lang="sass" scoped>
	@keyframes fade-in
		0%
			opacity: 0
			transform: translateY(-5px)
		100%
			opacity: 1
			transform: translateY(0)

	.profit-value, .profit-phrase
		animation: fade-in 0.3s ease-out
		display: inline-block
		text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5)
	// Añadir sombra para mejorar visibilidad en fondo oscuro

	// Define custom text color classes
	.text-very-success
		color: #3cf07d

	.text-extreme-success
		color: #5ff598

	.text-high-success
		color: #7dfaae

	.text-great-success
		color: #99ffbb

	.text-superb-success
		color: #a8f0a5

	.text-strong-success
		color: #b7f4b8

	.text-good-success
		color: #c8f7cb

	.text-positive-success
		color: #d9fadb

	.text-very-positive-success
		color: #e5ffe5

	.text-excellent-success
		color: #ccf5cc

	.text-fantastic-success
		color: #bbf0bb

	.text-outstanding-success
		color: #aaf9aa

	.text-super-success
		color: #99f499

	.text-mighty-success
		color: #89f589

	.text-stellar-success
		color: #79f679

	.text-strong-positive
		color: #68f768

	.text-good-positive
		color: #5af75a

	.text-positive-positive
		color: #4cf64c

	.text-decent-success
		color: #3df53d

	.text-satisfactory-success
		color: #2cf42c

	.text-moderate-success
		color: #1df31d

	.text-fair-success
		color: #0ef20e

	.text-passing-success
		color: #00e100

	.text-slight-success
		color: #a2ffb4

	.text-minimal-success
		color: #d2f5d4

	.text-minimal-loss
		color: #fffa8d

	.text-slight-loss
		color: #ffdf7a

	.text-passing-loss
		color: #ffc966

	.text-fair-loss
		color: #ffb24d

	.text-moderate-loss
		color: #ff9b33

	.text-satisfactory-loss
		color: #ff8d2a

	.text-decent-loss
		color: #ff7d20

	.text-positive-loss
		color: #ffbf00

	.text-good-loss
		color: #ffb07d

	.text-strong-loss
		color: #ff887d

	.text-stellar-loss
		color: #ff7777

	.text-mighty-loss
		color: #ff6a6a

	.text-super-loss
		color: #ff5555

	.text-outstanding-loss
		color: #ff4040

	.text-fantastic-loss
		color: #ff2d2d

	.text-excellent-loss
		color: #ff1919

	.text-very-positive-loss
		color: #ff0505

	.text-positive-positive-loss
		color: #ff4545

	.text-good-good-loss
		color: #ff5a5a

	.text-strong-strong-loss
		color: #ff7070

	.text-super-super-loss
		color: #ff8585

	.text-high-high-loss
		color: #ff9999

	.text-extreme-extreme-loss
		color: #ffb5b5

	.text-very-extreme-loss
		color: #ffcbcb

	.text-catastrophic-loss
		color: #ffdede

	.text-apocalyptic-loss
		color: #ffebeb
</style>


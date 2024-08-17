// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	ssr: false,
	devtools: { enabled: false },
	css: [
		'~/assets/styles/main.scss',
	],
	app: {
		head: {
			title: 'Luna AI - AI-powered Crypto Assistant',
			link: [
				// SVG
				{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
			],
			meta: [
				// OG
				{
					property: 'og:title',
					content: 'Luna AI: A Paradigm Shift in Cryptocurrency Management through Telegram'
				},
				{
					property: 'og:description',
					content: 'Luna is an AI and Crypto powered bot that helps you manage your cryptocurrency portfolio and trades. It is a powerful tool that provides you with real-time market data, trading signals, and portfolio management features.'
				},
				{ property: 'og:image', content: '/og-image.png' },
				{ property: 'og:url', content: 'https://app.lunadefi.ai' },

				// Twitter
				{ name: 'twitter:card', content: 'summary_large_image' },
				{
					name: 'twitter:title',
					content: 'Luna AI: A Paradigm Shift in Cryptocurrency Management through Telegram'
				},
				{
					name: 'twitter:description',
					content: 'Luna is an AI and Crypto powered bot that helps you manage your cryptocurrency portfolio and trades. It is a powerful tool that provides you with real-time market data, trading signals, and portfolio management features.'
				},
				{ name: 'twitter:image', content: '/og-image.png' },

				// General
				{
					name: 'description',
					content: 'Luna is an AI and Crypto powered bot that helps you manage your cryptocurrency portfolio and trades. It is a powerful tool that provides you with real-time market data, trading signals, and portfolio management features.'
				},
				{ name: 'viewport', content: 'width=device-width, initial-scale=1' },

				// Favicon
				{ name: 'msapplication-TileColor', content: '#000000' },
				{ name: 'theme-color', content: '#69F89B' },
			]
		},
	},
	modules: [
		'nuxt-icon',
		'nuxt-swiper',
		'nuxt-svgo',
		'@pinia/nuxt',
		'@nuxtjs/device',
		"@nuxtjs/google-fonts"
	],
	googleFonts: {
		families: {
			Inter: [ 400, 500, 600, 700 ],
		},
		display: 'swap',
		preconnect: true,
		preload: true,
	},
	imports: {
		dirs: [
			'stores',
		],
	},
	runtimeConfig: {
		public: {
			baseURL: process.env.BASE_URL || 'http://localhost:1337',
			appURL: process.env.APP_URL || 'http://localhost:3000',
			solanaRPC: process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
			tgBotUsername: process.env.TG_BOT_USERNAME || 'luna_debug_bot',
		},
	},
	vite: {
		css: {
			preprocessorOptions: {
				sass: {
					additionalData: '@import "~/assets/styles/variables.sass"\nbody\n\tmargin: 0',
				},
			},
		},
	},
})

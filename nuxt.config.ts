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
		},
	},
	modules: [
		'nuxt-icon',
		'nuxt-swiper',
		'nuxt-svgo',
		'@pinia/nuxt',
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
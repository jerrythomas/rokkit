import { defineConfig, presetWind3 } from 'unocss'

export default defineConfig({
	presets: [
		presetWind3({
			dark: {
				light: '[data-mode="light"]',
				dark: '[data-mode="dark"]'
			}
		})
	]
})

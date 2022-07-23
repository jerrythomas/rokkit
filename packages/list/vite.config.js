import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import unocss from 'unocss/vite'
import presetUno from '@unocss/preset-uno'
import presetIcons from '@unocss/preset-icons'
import transformer from '@unocss/transformer-directives'
import { extractorSvelte } from '@unocss/core'

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		unocss({
			presets: [presetUno(), presetIcons({})],
			extractors: [extractorSvelte],
			transformers: [transformer()]
		}),

		svelte()
	]
})

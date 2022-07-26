import { sveltekit } from '@sveltejs/kit/vite'
import unocss from 'unocss/vite'

/** @type {import('vite').UserConfig} */
const config = {
	plugins: [
		unocss(/*{
			presets: [presetUno(), presetIcons({})],
			extractors: [extractorSvelte],
			transformers: [transformer()]
		}*/),
		sveltekit()
	]
}

export default config

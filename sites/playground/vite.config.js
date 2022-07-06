import path from 'path'
import { sveltekit } from '@sveltejs/kit/vite'
import WindiCSS from 'vite-plugin-windicss'

/** @type {import('vite').UserConfig} */
const config = {
	plugins: [sveltekit(), WindiCSS()],
	resolve: {
		alias: {
			$config: path.resolve('./src/config')
		}
	}
}

export default config

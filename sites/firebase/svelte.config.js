import path from 'path'
import WindiCSS from 'vite-plugin-windicss'
import adapter from '@sveltejs/adapter-auto'

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter(),

		// hydrate the <div id="svelte"> element in src/app.html
		target: '#svelte',
		vite: {
			plugins: [WindiCSS()],
			resolve: {
				alias: {
					$config: path.resolve('./src/config')
				}
			}
		}
	}
}

export default config

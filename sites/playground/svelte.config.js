import path from 'path'
import adapter from '@sveltejs/adapter-auto'
import WindiCSS from 'vite-plugin-windicss'

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter(),
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

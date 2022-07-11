import fs from 'fs'
import path from 'path'
import { sveltekit } from '@sveltejs/kit/vite'
import WindiCSS from 'vite-plugin-windicss'

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'))

/** @type {import('vite').UserConfig} */
const config = {
	plugins: [sveltekit(), WindiCSS()],
	define: {
		__APP_VERSION__: JSON.stringify(pkg.version)
	},
	resolve: {
		alias: {
			$config: path.resolve('./src/config')
		}
	}
}

export default config

import { readFileSync } from 'fs'
import { sveltekit } from '@sveltejs/kit/vite'
import unocss from 'unocss/vite'
import { paraglideVitePlugin } from '@inlang/paraglide-js'
import { defineConfig } from 'vite'

const pkg = JSON.parse(readFileSync('package.json', 'utf8'))

export default defineConfig({
	plugins: [
		unocss(),
		paraglideVitePlugin({
			project: './project.inlang',
			outdir: './src/lib/paraglide',
			strategy: ['url', 'cookie', 'baseLocale']
		}),
		sveltekit()
	],
	define: {
		__APP_VERSION__: JSON.stringify(pkg.version)
	},
	assetsInclude: ['**/*.svelte'],
	server: {
		fs: {
			allow: ['..', '.']
		}
	}
})

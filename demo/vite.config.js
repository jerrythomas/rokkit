import { sveltekit } from '@sveltejs/kit/vite'
import { paraglideVitePlugin } from '@inlang/paraglide-js'
import unocss from 'unocss/vite'
import { defineConfig } from 'vite'

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
	server: {
		fs: { allow: ['..', '.'] }
	}
})

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
	},
	// @mlc-ai/web-llm ships its own bundled workers and uses dynamic imports
	// that confuse Vite's dependency optimiser (it hits a maximum call stack
	// transforming the package). Excluding from pre-bundling makes the dev
	// server fetch the module's own dist files directly, which works.
	optimizeDeps: {
		exclude: ['@mlc-ai/web-llm']
	},
	ssr: {
		noExternal: ['@mlc-ai/web-llm']
	}
})

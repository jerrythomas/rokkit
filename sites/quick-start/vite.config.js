import { readFileSync } from 'fs'
import { sveltekit } from '@sveltejs/kit/vite'
import unocss from 'unocss/vite'
import { paraglide } from '@inlang/paraglide-sveltekit/vite'
import { defineConfig } from 'vite'

const pkg = JSON.parse(readFileSync('package.json', 'utf8'))

export default defineConfig({
	plugins: [
		unocss(),
		paraglide({
			project: './project.inlang',
			outdir: './src/lib/paraglide'
		}),
		sveltekit()
	],
	define: {
		__APP_VERSION__: JSON.stringify(pkg.version)
	}
})

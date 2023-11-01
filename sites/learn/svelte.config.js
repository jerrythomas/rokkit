import adapter from '@sveltejs/adapter-auto'
import { mdsvex } from 'mdsvex'

/** @type {import('@sveltejs/kit').Config} */
const config = {
	extensions: ['.svelte', '.md'],
	preprocess: [
		mdsvex({
			extensions: ['.md']
		})
	],
	kit: {
		adapter: adapter()
	},
	vitePlugin: {
		inspector: {
			showToggleButton: 'always'
		}
	}
}

export default config

import adapter from '@sveltejs/adapter-auto'
import { mdsvex } from 'mdsvex'
// import { codeImport } from 'remark-code-import'

/** @type {import('@sveltejs/kit').Config} */
const config = {
	extensions: ['.svelte', '.svx'],
	preprocess: [
		mdsvex({
			// remarkPlugins: [codeImport],
			extensions: ['.svx']
		})
	],
	kit: {
		adapter: adapter()
	}
}

export default config

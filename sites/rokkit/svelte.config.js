import adapter from '@sveltejs/adapter-auto'
import { mdsvex } from 'mdsvex'
// import { codeImport } from 'remark-code-import'

/** @type {import('@sveltejs/kit').Config} */
const config = {
	extensions: ['.svelte', '.md'],
	preprocess: [
		mdsvex({
			// remarkPlugins: [codeImport],
			extensions: ['.md']
		})
	],
	kit: {
		adapter: adapter()
	}
}

export default config

import adapter from '@sveltejs/adapter-vercel'
import { mdsvex } from 'mdsvex'
// import preprocess from 'svelte-preprocess'

/** @type {import('@sveltejs/kit').Config} */
const config = {
	extensions: ['.svelte', '.svx'],
	preprocess: [
		mdsvex({
			extensions: ['.svx']
		})
	],
	kit: {
		adapter: adapter()
	}
}

export default config

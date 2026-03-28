import { sveltekit } from '@sveltejs/kit/vite'
import unocss from 'unocss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
	plugins: [unocss(), sveltekit()],
	server: {
		fs: { allow: ['..', '.'] }
	}
})

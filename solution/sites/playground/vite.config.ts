import { sveltekit } from '@sveltejs/kit/vite'
import unocss from 'unocss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
	plugins: [unocss(), sveltekit()],
	optimizeDeps: {
		exclude: ['shiki', '@shikijs/langs', '@shikijs/themes']
	},
	server: {
		fs: {
			allow: ['../..']
		}
	}
})

import { sveltekit } from '@sveltejs/kit/vite'
import unocss from 'unocss/vite'
/** @type {import('vite').UserConfig} */
const config = {
	plugins: [unocss(), sveltekit()],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
}

export default config

import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import unocss from '@unocss/vite';

export default defineConfig({
	plugins: [unocss(), sveltekit()],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});

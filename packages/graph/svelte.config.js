import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

// Standalone config for `svelte-package`. vitePreprocess transpiles
// `<script lang="ts">` so svelte-package can emit processed `.svelte` + `.svelte.d.ts`.
/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	compilerOptions: { runes: true }
}

export default config

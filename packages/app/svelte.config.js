import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

// Standalone config for `svelte-package` (the dev/test pipeline gets preprocessing
// from vite-plugin-svelte directly). vitePreprocess transpiles `<script lang="ts">`
// in components so svelte-package can emit processed `.svelte` + `.svelte.d.ts`.
/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	compilerOptions: { runes: true }
}

export default config

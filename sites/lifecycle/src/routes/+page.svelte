<script>
	import { logger } from '$lib';
	import { page } from '$app/stores';
	export let data;

	logger.info({
		file: '/page.svelte',
		method: 'script',
		data,
		path: $page.url.pathname,
		hash: $page.url.hash
	});
</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>

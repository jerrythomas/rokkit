<script>
	import { logger } from '$lib';
	import { page } from '$app/stores';

	/** @type {import('./$types').LayoutData} */
	export let data;

	logger.info({
		file: '/layout.svelte',
		method: 'script',
		path: $page.url.pathname,
		hash: $page.url.hash,
		data
	});
</script>

<main>
	<slot />
</main>

<script>
	import { kavach, logger } from '$lib/session'
	import { onMount } from 'svelte'
	import { page } from '$app/stores'
	import About from '$lib/About.svelte'

	onMount(async () => {
		await logger.debug({
			file: './auth/layout.svelte',
			method: 'onMount',
			path: $page.url.pathname
		})
		kavach.onAuthChange()
	})
</script>

<aside class="flex bg-primary w-1/2 p-8 items-center justify-center">
	<About />
</aside>
<slot />

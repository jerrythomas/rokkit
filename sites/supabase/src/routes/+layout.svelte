<script>
	import 'uno.css'
	import '@unocss/reset/tailwind.css'
	import '../app.scss'
	import { kavach, logger } from '$lib/session'
	import { onMount } from 'svelte'
	import { page } from '$app/stores'
	/** @type {import('./$types').LayoutData} */
	export let data
	onMount(async () => {
		await logger.debug({
			file: './layout.svelte',
			method: 'onMount',
			path: $page.url.pathname,
			data
		})
		kavach.onAuthChange()
	})
</script>

<slot />

<script lang="ts">
	import { onMount } from 'svelte'
	import { setShellResponse, setShellVariant, shell } from '$lib/koan/shell.svelte'
	import { page } from '$app/state'

	onMount(() => {
		if (!shell.lastQuery) shell.lastQuery = 'Show me an ER diagram'
		setShellResponse('graph')
	})

	// $effect rather than onMount so changing `?variant=X` updates state without
	// remounting the page. page.url is reactive in SvelteKit. Without this the variant
	// chips navigate, the URL changes, and the canvas never hears about it.
	$effect(() => {
		setShellVariant(page.url.searchParams.get('variant'))
	})
</script>

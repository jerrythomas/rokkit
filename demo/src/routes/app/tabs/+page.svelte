<script lang="ts">
	import { onMount } from 'svelte'
	import { setShellResponse, setShellVariant, shell } from '$lib/koan/shell.svelte'
	import { page } from '$app/state'

	onMount(() => {
		if (!shell.lastQuery) shell.lastQuery = 'Show me how Tabs work'
		setShellResponse('tabs')
	})

	// $effect rather than onMount so changing `?variant=X` updates state
	// without remounting the page. page.url is reactive in SvelteKit.
	$effect(() => {
		setShellVariant(page.url.searchParams.get('variant'))
	})
</script>

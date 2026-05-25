<script lang="ts">
	import { onMount } from 'svelte'
	import { setShellResponse, setShellVariant, shell } from '$lib/koan/shell.svelte'
	import { page } from '$app/state'

	onMount(() => {
		if (!shell.lastQuery) shell.lastQuery = 'Toast notifications'
		setShellResponse('toasts')
	})

	$effect(() => {
		setShellVariant(page.url.searchParams.get('variant'))
	})
</script>

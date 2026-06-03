<script lang="ts">
	import { onMount } from 'svelte'
	import { setShellResponse, setShellVariant, shell } from '$lib/koan/shell.svelte'
	import { page } from '$app/state'

	onMount(() => {
		if (!shell.lastQuery) shell.lastQuery = 'Hierarchical sortable tree table'
		setShellResponse('tree-table')
	})

	$effect(() => {
		setShellVariant(page.url.searchParams.get('variant'))
	})
</script>

<script lang="ts">
	import { onMount } from 'svelte'
	import { setShellResponse, shell } from '$lib/koan/shell.svelte'

	onMount(() => {
		if (!shell.lastQuery) shell.lastQuery = 'Combobox with type-to-filter'
		setShellResponse('combo')
	})
</script>

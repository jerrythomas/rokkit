<script lang="ts">
	import { onMount } from 'svelte'
	import { setShellResponse, shell } from '$lib/koan/shell.svelte'

	onMount(() => {
		if (!shell.lastQuery) shell.lastQuery = 'Getting Started'
		setShellResponse('guide-getting-started')
	})
</script>

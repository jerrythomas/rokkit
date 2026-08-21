<script lang="ts">
	import { onMount } from 'svelte'
	import { setShellBrowse } from '$lib/koan/shell.svelte'

	/**
	 * Browse-first entry point: the full demo catalog as a grid, without the landing
	 * hero. Mirrors how every demo route drives the shell — onMount tells the shell what
	 * to render, and the shared layout owns the surface. Replaces a 308 redirect to /app
	 * that stood in for this route.
	 */
	onMount(() => {
		setShellBrowse()
	})
</script>

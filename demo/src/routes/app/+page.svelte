<script lang="ts">
	import { onMount } from 'svelte'
	import { setShellWelcome } from '$lib/koan/shell.svelte'

	onMount(() => {
		setShellWelcome()
	})
</script>

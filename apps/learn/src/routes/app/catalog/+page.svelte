<script lang="ts">
	import { onMount } from 'svelte'
	import { setShellCatalog } from '$lib/koan/shell.svelte'

	onMount(() => {
		setShellCatalog()
	})
</script>

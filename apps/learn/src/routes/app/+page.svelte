<script lang="ts">
	import { onMount } from 'svelte'
	import { setShellLanding } from '$lib/koan/shell.svelte'

	onMount(() => {
		setShellLanding()
	})
</script>

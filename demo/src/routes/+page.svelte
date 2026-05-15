<script lang="ts">
	import Shell from '$lib/koan/components/Shell.svelte'
	import { koan, selectDemo } from '$lib/koan/store.svelte'
	import { onMount } from 'svelte'

	onMount(() => {
		const params = new URL(window.location.href).searchParams
		const demoId = params.get('demo')
		const q = params.get('q')
		if (q) koan.query = q
		if (demoId) selectDemo(demoId)
	})
</script>

<svelte:head>
	<title>Koan — Rokkit demo</title>
</svelte:head>

<Shell />

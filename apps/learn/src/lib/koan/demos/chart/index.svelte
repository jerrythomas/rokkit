<script lang="ts">
	import { onMount } from 'svelte'
	import ChartExplorer from './ChartExplorer.svelte'
	import { explorer } from './store.svelte'
	import { registry } from './registry'

	// `type` lets the AI (mount_charts) open the explorer pre-set to a requested chart.
	let { type = undefined }: { type?: string } = $props()

	onMount(() => {
		if (type && registry[type]) explorer.select(type)
	})
</script>

<ChartExplorer />

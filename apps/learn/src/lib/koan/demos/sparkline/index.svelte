<script lang="ts">
	import { onMount } from 'svelte'
	import SparklineExplorer from './SparklineExplorer.svelte'
	import { sparkline } from './store.svelte'

	// `type` lets the AI (mount_sparkline) open the explorer pre-set.
	let { type = undefined }: { type?: string } = $props()

	onMount(() => {
		if (type === 'line' || type === 'bar' || type === 'area') sparkline.set('type', type)
	})
</script>

<SparklineExplorer />

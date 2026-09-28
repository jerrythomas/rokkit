<script lang="ts">
	import { onMount } from 'svelte'
	import GraphExplorer from './GraphExplorer.svelte'
	import { explorer } from './store.svelte'
	import { datasets } from './datasets'

	// `dataset` lets the AI (mount_graph) open the explorer on a requested dataset.
	let { dataset = undefined }: { dataset?: string } = $props()

	onMount(() => {
		if (dataset && dataset in datasets) {
			explorer.selectDataset(dataset as keyof typeof datasets)
		}
	})
</script>

<GraphExplorer />

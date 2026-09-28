<script lang="ts">
	import GraphExplorer from './GraphExplorer.svelte'
	import { explorer } from './store.svelte'
	import { datasets } from './datasets'

	// `dataset` is how both the AI tool (mount_graph) and the variant chips open the
	// explorer on a specific example — 'ecommerce' is the ER diagram, 'service-calls' the
	// call graph.
	let { dataset = undefined }: { dataset?: string } = $props()

	// An $effect rather than onMount: picking a variant changes this prop on an ALREADY
	// mounted component, so onMount would apply the first example and silently ignore
	// every later pick. Guarded on change so it never fights the user's own control —
	// choosing a dataset by hand stays chosen until the variant actually differs.
	let applied = $state<string | undefined>(undefined)
	$effect(() => {
		if (dataset && dataset !== applied && dataset in datasets) {
			applied = dataset
			explorer.selectDataset(dataset as keyof typeof datasets)
		}
	})
</script>

<GraphExplorer />

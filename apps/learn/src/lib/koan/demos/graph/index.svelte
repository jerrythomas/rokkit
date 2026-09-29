<script lang="ts">
	import GraphExplorer from './GraphExplorer.svelte'
	import { explorer } from './store.svelte'
	import { registry, type DiagramId } from './registry'

	// `diagram` is how both the AI tool (mount_graph) and the variant chips open the explorer
	// on a specific example. A diagram carries its dataset, so there is nothing else to pick —
	// which is what stops an ER dataset being pointed at a radial tree.
	let { diagram = undefined }: { diagram?: string } = $props()

	// An $effect rather than onMount: picking a variant changes this prop on an ALREADY
	// mounted component, so onMount would apply the first example and silently ignore every
	// later pick. Guarded on change so it never fights the reader's own control.
	let applied = $state<string | undefined>(undefined)
	$effect(() => {
		if (diagram && diagram !== applied && diagram in registry) {
			applied = diagram
			explorer.select(diagram as DiagramId)
		}
	})
</script>

<GraphExplorer />

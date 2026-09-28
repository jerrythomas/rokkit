<script lang="ts">
	/**
	 * The COMPONENT layer. It renders and routes intent; it derives nothing.
	 *
	 * ONE GraphState is built from the store's choices and shared by all three views. That is
	 * what makes selection two-way for free: clicking a node in the diagram sets state.value,
	 * and EntityView already reads it — no wiring between the views at all.
	 */
	import { untrack } from 'svelte'
	import { vibe } from '@rokkit/states'
	import { Graph, GraphState, createGraphPreset } from '@rokkit/graph'
	import { EntitiesView, EntityView } from '@rokkit/graph/schema'
	import { explorer, GROUPING } from './store.svelte'
	import { datasets } from './datasets'

	const dataset = $derived(datasets[explorer.dataset])

	// Named `graph`, not `state`: a local binding literally called `state` makes the compiler
	// read the `$state` rune below as a store subscription on it ("s.subscribe is not a
	// function"). Same trap Graph.svelte hit with its `state` prop.
	//
	// A single instance for the component's lifetime — Graph captures it in context at init,
	// so it must not be replaced. untrack keeps this initial read out of the creating scope's
	// dependencies; the $effect below is the sole mechanism that keeps it live.
	const graph = untrack(
		() =>
			new GraphState({
				nodes: dataset.nodes,
				edges: dataset.edges,
				fields: dataset.fields
			})
	)

	$effect(() => {
		graph.update({
			nodes: dataset.nodes,
			edges: dataset.edges,
			fields: dataset.fields,
			layout: explorer.layout,
			density: explorer.density,
			arrange: explorer.arrange,
			...GROUPING[explorer.grouping],
			edgeStyle: explorer.edgeStyle,
			preset: createGraphPreset({ using: explorer.using }),
			// Without this the group ramp resolves from the LIGHT ladder forever, so every
			// cluster keeps its pale shade-100 fill in dark mode and the canvas reads as
			// light whatever the app is set to. GraphState defaults to 'light'; nothing
			// infers the mode for you.
			mode: vibe.mode === 'dark' ? 'dark' : 'light',
			// update() fully re-applies, so the selection has to be carried back in explicitly
			// or every control change would clear it.
			value: graph.value
		})
	})

	// Switching dataset leaves a selection that names nothing in the new one, which would show
	// an empty entity panel with no visible reason. Clear it as the dataset changes.
	let lastDataset = $state(explorer.dataset)
	$effect(() => {
		if (explorer.dataset !== lastDataset) {
			lastDataset = explorer.dataset
			graph.clear()
		}
	})
</script>

<!-- No control panel here on purpose. The knobs live in the composer's toggled details slab,
     the same place chart and sparkline put theirs, so the canvas stays undisturbed when they
     are closed. -->
<div data-graph-explorer class="explorer">
	<div class="stage">
		{#if explorer.view === 'diagram'}
			<div class="canvas">
				<Graph state={graph} bind:zoom={explorer.zoom} bind:density={explorer.density} />
			</div>
		{:else if explorer.view === 'entity'}
			<div class="scroll">
				<EntityView state={graph} />
			</div>
		{:else}
			<div class="scroll">
				<EntitiesView state={graph} caption="Entities" />
			</div>
		{/if}
	</div>
</div>

<style>
	.explorer {
		display: flex;
		flex-direction: column;
		min-height: 0;
		height: 100%;
	}

	.stage {
		flex: 1;
		position: relative;
		min-width: 0;
		min-height: 28rem;
	}

	/* Graph's viewport fills its nearest positioned ancestor, so it needs a sized box. */
	.canvas {
		position: absolute;
		inset: 0;
	}

	.scroll {
		height: 100%;
		max-height: 34rem;
		overflow: auto;
		padding: 0.25rem;
	}
</style>

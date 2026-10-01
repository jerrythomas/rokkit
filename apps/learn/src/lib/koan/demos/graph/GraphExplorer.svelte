<script lang="ts">
	/**
	 * The COMPONENT layer. It renders and routes intent; it derives nothing.
	 *
	 * The diagram is chosen from the registry, which carries its dataset with it — so the
	 * component and the shape of data it reads cannot be mismatched. Each named diagram brings
	 * the controls that mean something for it, which is why there is no layout picker here any
	 * more: switching diagram IS switching layout, and doing it by name keeps the data with it.
	 *
	 * ONE GraphState is built here and handed to the diagram, so the entity views beside it
	 * share the selection for free: clicking a node sets `state.value`, and `EntityView`
	 * already reads it. That is what the diagrams' `state` prop is for.
	 */
	import { untrack } from 'svelte'
	import { vibe } from '@rokkit/states'
	import { GraphState, createGraphPreset } from '@rokkit/graph'
	import { EntitiesView, EntityView } from '@rokkit/graph/schema'
	import { explorer } from './store.svelte'
	import { datasets } from './datasets'

	const config = $derived(explorer.config)

	/** A containment diagram opens at a path; everything else ignores it, so `[]`. */
	const openingPath = (props: Record<string, unknown> | undefined) =>
		(props?.focusPath as string[] | undefined) ?? []
	const dataset = $derived(datasets[config.dataset])

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

	// The diagram this state last opened. Plain, not $state: it is bookkeeping for the effect
	// below, and reading it must not make the effect depend on it.
	let opened: string | null = null

	/** True once per diagram switch — the first update for a diagram applies its opening path. */
	function freshDiagram(): boolean {
		if (opened === explorer.diagram) return false
		opened = explorer.diagram
		return true
	}

	/**
	 * The polymetric channels the reader picked, carried back like the drill path: update()
	 * fully re-applies, so the registry's opening measures would otherwise undo a pick the next
	 * time anything changed. Undefined for every other diagram, where they mean nothing.
	 */
	const pickedChannels = () =>
		untrack(() => ({
			widthBy: graph.config.widthBy,
			heightBy: graph.config.heightBy,
			colorBy: graph.config.colorBy
		}))

	$effect(() => {
		const fresh = freshDiagram()
		graph.update({
			nodes: dataset.nodes,
			edges: dataset.edges,
			fields: dataset.fields,
			// From the registry, not from the component: `update()` fully re-applies, so a
			// layout the diagram set for itself would be reset here on the next run. The spec
			// compares the two so they cannot drift.
			layout: config.layout,
			...config.props,
			...(fresh ? {} : pickedChannels()),
			// The drill path, carried back like `value` below: update() fully re-applies, so the
			// registry's OPENING path spread above would snap a drilled diagram back to its start
			// whenever anything else changed — selecting a box, say. The state holds where the
			// reader drilled to; only a newly opened diagram starts at its registry path.
			focusPath: fresh ? openingPath(config.props) : untrack(() => graph.drillPath),
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

	// Switching diagram leaves a selection that names nothing in the new dataset, which would
	// show an empty entity panel with no visible reason.
	let lastDiagram = $state(explorer.diagram)
	$effect(() => {
		if (explorer.diagram !== lastDiagram) {
			lastDiagram = explorer.diagram
			graph.clear()
		}
	})
</script>

<!-- The diagram's OWN controls sit on its canvas; the composer's details slab holds only the
     choices the demo adds around it (which diagram, which view, the colour channel). -->
<div data-graph-explorer class="explorer">
	<p data-graph-blurb class="blurb">{config.blurb}</p>
	<div class="stage">
		{#if explorer.view === 'diagram'}
			{@const Diagram = config.component}
			<div class="canvas">
				<Diagram
					state={graph}
					{...config.props}
					controls={explorer.controls}
					legend={explorer.legend}
				/>
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

	.blurb {
		flex: none;
		margin: 0 0 0.5rem;
		font-size: 0.8125rem;
		color: var(--ink-mute);
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

<script lang="ts">
	/**
	 * The intended layers, top to bottom, with every dependency between them (#167).
	 *
	 * Arrows should only point DOWN. The ones that climb are layer violations and are the output
	 * of the view — `ViolationsControl` shows only those. The host assigns each node its `layer`
	 * (it knows the architecture it intends); rokkit computes no depth, and marks each edge
	 * `down` / `skip` / `up` / `level` from those layers unless the host already said.
	 */
	import Graph from '../Graph.svelte'
	import GraphLegend from '../GraphLegend.svelte'
	import DiagramFrame from './DiagramFrame.svelte'
	import DensityControl from '../controls/DensityControl.svelte'
	import DrillBar from '../controls/DrillBar.svelte'
	import ViolationsControl from '../controls/ViolationsControl.svelte'
	import ZoomControl from '../controls/ZoomControl.svelte'
	import { GraphState } from '../GraphState.svelte.js'
	import type { Density } from '../layout/types.js'
	import type { GraphFields, GraphNode } from '../types.js'
	import type { GraphPreset } from '../preset.js'

	type Props = {
		/** Share one state with another view — see `DependencyDiagram`. */
		state?: GraphState
		nodes?: unknown[]
		edges?: unknown[]
		fields?: GraphFields
		density?: Density
		/** Every edge, or only the ones that climb. Bindable — the control moves it. */
		showEdges?: 'all' | 'violations'
		/** Band names by layer index; an unnamed layer reads "Layer N". */
		layerLabels?: string[]
		controls?: boolean
		legend?: boolean
		value?: string | null
		preset?: GraphPreset
		mode?: 'light' | 'dark'
		arrows?: boolean
		label?: string
		onselect?: (id: string | null) => void
		onexpand?: (id: string, node: GraphNode) => void
		oncollapse?: (id: string, node: GraphNode) => void
		class?: string
	}

	let {
		state: provided,
		nodes = [],
		edges = [],
		fields = {},
		density = $bindable('names'),
		showEdges = $bindable('all'),
		layerLabels = undefined,
		controls = false,
		legend = false,
		value = $bindable(undefined),
		preset = undefined,
		mode = 'light',
		arrows = true,
		label = undefined,
		onselect = undefined,
		onexpand = undefined,
		oncollapse = undefined,
		class: className = ''
	}: Props = $props()

	let zoom = $state(1)

	const config = () => ({
		nodes,
		edges,
		fields,
		layout: 'layers',
		density,
		showEdges,
		layerLabels,
		value,
		preset,
		mode,
		label,
		onselect,
		onexpand,
		oncollapse
	})

	// svelte-ignore state_referenced_locally
	const graph = provided ?? new GraphState(config())

	$effect(() => {
		if (!provided) {
			graph.update(config())
			return
		}
		// A supplied state is the caller's — see DependencyDiagram. Only this component's own
		// options are merged in.
		const { nodes: _n, edges: _e, fields: _f, preset: _p, mode: _m, value: _v, ...mine } =
			config()
		graph.apply(mine)
	})
</script>

<!-- Snippets are declared OUTSIDE the frame and passed conditionally — see DependencyDiagram. -->
{#snippet controlBar()}
	<DrillBar state={graph} />
	{#if controls}
		<ViolationsControl {showEdges} onchange={(v) => (showEdges = v)} />
		<DensityControl {density} onchange={(v) => (density = v)} />
		<ZoomControl {zoom} onchange={(v) => (zoom = v)} />
	{/if}
{/snippet}

{#snippet legendBar()}
	<GraphLegend state={graph} relations />
{/snippet}

<DiagramFrame
	class={className}
	overlay={controls || graph.showsDrillBar ? controlBar : undefined}
	footer={legend ? legendBar : undefined}
>
	{#snippet canvas()}
		<Graph state={graph} bind:zoom {arrows} />
	{/snippet}
</DiagramFrame>

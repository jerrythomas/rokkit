<script lang="ts">
	/**
	 * Table entities and their foreign keys, ranked so direction reads off the geometry.
	 *
	 * An ER diagram is table entities and their relationships — a view is a derived projection
	 * and a routine is behaviour, so neither belongs here. Pass `toGraphInput(model, 'er')`
	 * from `@rokkit/graph/schema` and the split is made for you.
	 *
	 * `flow` gives up group boxes to rank by reference direction, so `groupTint` is on by
	 * default: without it the schema a table belongs to becomes invisible, which is the one
	 * thing the older cluster arrangement did show.
	 */
	import Graph from '../Graph.svelte'
	import GraphLegend from '../GraphLegend.svelte'
	import DiagramFrame from './DiagramFrame.svelte'
	import DensityControl from '../controls/DensityControl.svelte'
	import EdgeStyleControl from '../controls/EdgeStyleControl.svelte'
	import ZoomControl from '../controls/ZoomControl.svelte'
	import { GraphState } from '../GraphState.svelte.js'
	import type { Density, EdgeStyle } from '../layout/types.js'
	import type { GraphFields } from '../types.js'
	import type { GraphPreset } from '../preset.js'

	type Props = {
		nodes?: unknown[]
		edges?: unknown[]
		fields?: GraphFields
		density?: Density
		edgeStyle?: EdgeStyle
		/** Paint each card with its schema colour. On by default — `flow` has no group boxes. */
		groupTint?: boolean
		/** Show the on-canvas density, edge-style and zoom controls. */
		controls?: boolean
		/** Show a key under the canvas. Keyed by GROUP, which is what the tint encodes. */
		legend?: boolean
		value?: string | null
		preset?: GraphPreset
		mode?: 'light' | 'dark'
		arrows?: boolean
		label?: string
		onselect?: (id: string | null) => void
		class?: string
	}

	let {
		nodes = [],
		edges = [],
		fields = {},
		density = $bindable('keys'),
		edgeStyle = $bindable('curved'),
		groupTint = true,
		controls = false,
		legend = false,
		value = $bindable(undefined),
		preset = undefined,
		mode = 'light',
		arrows = true,
		label = undefined,
		onselect = undefined,
		class: className = ''
	}: Props = $props()

	let zoom = $state(1)

	const graph = new GraphState({
		nodes,
		edges,
		fields,
		layout: 'flow',
		density,
		edgeStyle,
		groupTint,
		value,
		preset,
		mode,
		label,
		onselect
	})

	$effect(() => {
		graph.update({
			nodes,
			edges,
			fields,
			layout: 'flow',
			density,
			edgeStyle,
			groupTint,
			value,
			preset,
			mode,
			label,
			onselect
		})
	})
</script>

<!-- Snippets are declared OUTSIDE the frame and passed conditionally: one declared
     inside is always defined, so the frame would render an empty control bar over
     every diagram that asked for none. -->
{#snippet controlBar()}
	<DensityControl {density} onchange={(v) => (density = v)} />
	<EdgeStyleControl {edgeStyle} onchange={(v) => (edgeStyle = v)} />
	<ZoomControl {zoom} onchange={(v) => (zoom = v)} />
{/snippet}

{#snippet legendBar()}
	<GraphLegend state={graph} groups />
{/snippet}

<DiagramFrame
	class={className}
	overlay={controls ? controlBar : undefined}
	footer={legend ? legendBar : undefined}
>
	{#snippet canvas()}
		<Graph state={graph} bind:zoom {arrows} />
	{/snippet}
</DiagramFrame>

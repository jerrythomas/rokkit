<script lang="ts">
	/**
	 * Containment as nested rectangles, area proportional to a measure.
	 *
	 * Answers "where is the mass" — a box's area is what it CONTAINS, so the tree sums
	 * subtrees rather than counting nodes. Every box is the same shape at every depth,
	 * including a leaf: a treemap nests one thing.
	 *
	 * No edges. Containment IS the relationship here, and at this scale an adjacency graph
	 * cannot be drawn.
	 */
	import Graph from '../Graph.svelte'
	import GraphLegend from '../GraphLegend.svelte'
	import DiagramFrame from './DiagramFrame.svelte'
	import DepthControl from '../controls/DepthControl.svelte'
	import ZoomControl from '../controls/ZoomControl.svelte'
	import { GraphState } from '../GraphState.svelte.js'
	import type { GraphFields } from '../types.js'
	import type { GraphPreset } from '../preset.js'

	type Props = {
		nodes?: unknown[]
		edges?: unknown[]
		fields?: GraphFields
		/** What area encodes. A `measures` key, or `weight`, or `degree`. */
		sizeBy?: string
		/** How many levels below the focus to materialise. */
		levels?: number
		/** The subtree to render as the whole canvas. `[]` is the root. Drilling, not zooming. */
		focusPath?: string[]
		controls?: boolean
		maxLevels?: number
		legend?: boolean
		value?: string | null
		preset?: GraphPreset
		mode?: 'light' | 'dark'
		label?: string
		onselect?: (id: string | null) => void
		class?: string
	}

	let {
		nodes = [],
		edges = [],
		fields = {},
		sizeBy = 'weight',
		levels = $bindable(2),
		focusPath = $bindable([]),
		controls = false,
		maxLevels = 4,
		legend = false,
		value = $bindable(undefined),
		preset = undefined,
		mode = 'light',
		label = undefined,
		onselect = undefined,
		class: className = ''
	}: Props = $props()

	let zoom = $state(1)

	const config = () => ({
		nodes,
		edges,
		fields,
		layout: 'world',
		sizeBy,
		levels,
		focusPath,
		value,
		preset,
		mode,
		label,
		onselect
	})

	const graph = new GraphState(config())

	$effect(() => {
		graph.update(config())
	})
</script>

<!-- Snippets are declared OUTSIDE the frame and passed conditionally: one declared
     inside is always defined, so the frame would render an empty control bar over
     every diagram that asked for none. -->
{#snippet controlBar()}
	<DepthControl {levels} max={maxLevels} onchange={(v) => (levels = v)} />
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
		<Graph state={graph} bind:zoom arrows={false} />
	{/snippet}
</DiagramFrame>

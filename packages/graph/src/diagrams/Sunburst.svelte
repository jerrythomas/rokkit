<script lang="ts">
	/**
	 * The same containment as a treemap, drawn as nested wedges.
	 *
	 * Angle carries the measure and RADIUS carries the depth, so how deep the tree goes is the
	 * first thing you read — which is exactly what a treemap makes you hunt for. A treemap
	 * spends its pixels better; neither is the right one, which is why both exist.
	 *
	 * Same tree, same measure, same captions as `Treemap`, so switching between them keeps
	 * your place.
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
		layout: 'sunburst',
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

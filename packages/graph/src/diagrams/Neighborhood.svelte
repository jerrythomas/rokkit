<script lang="ts">
	/**
	 * One node and what reaches it, walked a hop at a time.
	 *
	 * The answer to "what touches this" — and at `depth: 2`, to "what does changing this
	 * reach", which is the question a reader has before editing something. Cards are built at
	 * full detail unconditionally: a portrait of one node's surroundings that hides the
	 * columns its edges land on defeats its own purpose, which is why there is no density
	 * control here.
	 */
	import Graph from '../Graph.svelte'
	import GraphLegend from '../GraphLegend.svelte'
	import DiagramFrame from './DiagramFrame.svelte'
	import DepthControl from '../controls/DepthControl.svelte'
	import EdgeStyleControl from '../controls/EdgeStyleControl.svelte'
	import ZoomControl from '../controls/ZoomControl.svelte'
	import { GraphState } from '../GraphState.svelte.js'
	import type { EdgeStyle } from '../layout/types.js'
	import type { GraphFields } from '../types.js'
	import type { GraphPreset } from '../preset.js'

	type Props = {
		nodes?: unknown[]
		edges?: unknown[]
		fields?: GraphFields
		/** The node to centre. Defaults to the selection. */
		focus?: string | null
		/** How many hops out. One answers "what touches this"; two, "what does this reach". */
		depth?: number
		edgeStyle?: EdgeStyle
		controls?: boolean
		maxDepth?: number
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
		focus = $bindable(null),
		depth = $bindable(1),
		edgeStyle = $bindable('curved'),
		controls = false,
		maxDepth = 3,
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

	const config = () => ({
		nodes,
		edges,
		fields,
		layout: 'neighborhood',
		focus,
		depth,
		edgeStyle,
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
	<DepthControl levels={depth} max={maxDepth} onchange={(v) => (depth = v)} />
	<EdgeStyleControl {edgeStyle} onchange={(v) => (edgeStyle = v)} />
	<ZoomControl {zoom} onchange={(v) => (zoom = v)} />
{/snippet}

{#snippet legendBar()}
	<GraphLegend state={graph} kinds relations />
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

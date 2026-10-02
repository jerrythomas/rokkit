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
	import DrillBar from '../controls/DrillBar.svelte'
	import EdgeStyleControl from '../controls/EdgeStyleControl.svelte'
	import ZoomControl from '../controls/ZoomControl.svelte'
	import { GraphState } from '../GraphState.svelte.js'
	import type { EdgeStyle } from '../layout/types.js'
	import type { GraphFields, GraphNode } from '../types.js'
	import type { GraphPreset } from '../preset.js'

	type Props = {
		/**
		 * Share one state across this diagram and, say, an entity table beside it. Given one,
		 * the caller owns it: this component reads it and never calls `update`, exactly as
		 * `Graph` does — two owners writing one state fight on every render.
		 */
		state?: GraphState
		nodes?: unknown[]
		edges?: unknown[]
		fields?: GraphFields
		/** The node to centre. Defaults to the selection. */
		focus?: string | null
		/** How many hops out. One answers "what touches this"; two, "what does this reach". */
		depth?: number
		edgeStyle?: EdgeStyle
		/**
		 * Mark each card with its group's colour (#172). On by default, as in `ErDiagram`: a
		 * neighbourhood has no group boxes either, so without it a table's schema is visible at
		 * the root and invisible one click later.
		 */
		groupTint?: boolean
		/**
		 * What the canvas centres (#170): the drawn cards (default), or the focus card — which
		 * leaves a blank column when one side of the focus is empty.
		 */
		centre?: 'content' | 'focus'
		controls?: boolean
		maxDepth?: number
		legend?: boolean
		value?: string | null
		preset?: GraphPreset
		mode?: 'light' | 'dark'
		arrows?: boolean
		label?: string
		onselect?: (id: string | null) => void
		/** The reader expanded a group node (#166) — with its members in `nodes`, they appear at once. */
		onexpand?: (id: string, node: GraphNode) => void
		/** The reader collapsed a group back into one node. */
		oncollapse?: (id: string, node: GraphNode) => void
		class?: string
	}

	let {
		state: provided,
		nodes = [],
		edges = [],
		fields = {},
		focus = $bindable(null),
		depth = $bindable(1),
		edgeStyle = $bindable('curved'),
		groupTint = true,
		centre = 'content',
		controls = false,
		maxDepth = 3,
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
		layout: 'neighborhood',
		focus,
		depth,
		edgeStyle,
		groupTint,
		centre,
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

		// A supplied state is the caller's: their data, preset, mode and selection stay theirs
		// and are never reset here. What this component DOES own is the options its own
		// controls drive — the layout above all, since choosing this component is choosing it.
		// `apply` merges; `update` would revert everything it does not name.
		const { nodes: _n, edges: _e, fields: _f, preset: _p, mode: _m, value: _v, ...mine } =
			config()
		graph.apply(mine)
	})
</script>

<!-- Snippets are declared OUTSIDE the frame and passed conditionally: one declared
     inside is always defined, so the frame would render an empty control bar over
     every diagram that asked for none. -->
{#snippet controlBar()}
	<DrillBar state={graph} />
	{#if controls}
		<DepthControl levels={depth} max={maxDepth} onchange={(v) => (depth = v)} />
		<EdgeStyleControl {edgeStyle} onchange={(v) => (edgeStyle = v)} />
		<ZoomControl {zoom} onchange={(v) => (zoom = v)} />
	{/if}
{/snippet}

{#snippet legendBar()}
	<GraphLegend state={graph} kinds relations />
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

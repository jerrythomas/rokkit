<script lang="ts">
	/**
	 * A call graph as a tidy tree or dendrogram around a circle.
	 *
	 * Angle separates the subtrees, radius carries the depth — which is the question a call
	 * graph asks. Packing it into boxes instead answers "how much is there" and, at any real
	 * size, reads as a stack of colliding labels.
	 *
	 * `levels` is the control that makes it legible over a codebase: a dendrogram of a whole
	 * repo puts every leaf on one rim, each a fraction of a degree wide. Show the crates, then
	 * set `root` to drill into one — a dendrogram of dendrograms.
	 */
	import Graph from '../Graph.svelte'
	import GraphLegend from '../GraphLegend.svelte'
	import DiagramFrame from './DiagramFrame.svelte'
	import DepthControl from '../controls/DepthControl.svelte'
	import DrillBar from '../controls/DrillBar.svelte'
	import ZoomControl from '../controls/ZoomControl.svelte'
	import { GraphState } from '../GraphState.svelte.js'
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
		/** `tree` reads radius as depth; `dendrogram` pins every leaf to the rim. */
		radialMode?: 'tree' | 'dendrogram'
		/** How many levels out from the root to draw. Unset draws the whole tree. */
		levels?: number
		/** The node to centre on — drilling. Unset roots at whatever nothing calls. */
		root?: string | null
		/** What a node's area encodes. `degree` counts edges. */
		sizeBy?: string
		sizeScale?: 'linear' | 'log'
		controls?: boolean
		/** Deepest level the depth control offers. */
		maxLevels?: number
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
		radialMode = 'tree',
		levels = $bindable(undefined),
		root = $bindable(null),
		sizeBy = 'degree',
		sizeScale = 'linear',
		controls = false,
		maxLevels = 4,
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
		layout: 'radial',
		radialMode,
		levels,
		root,
		sizeBy,
		sizeScale,
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
		<DepthControl levels={levels ?? maxLevels} max={maxLevels} onchange={(v) => (levels = v)} />
		<ZoomControl {zoom} onchange={(v) => (zoom = v)} />
	{/if}
{/snippet}

{#snippet legendBar()}
	<GraphLegend state={graph} kinds />
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

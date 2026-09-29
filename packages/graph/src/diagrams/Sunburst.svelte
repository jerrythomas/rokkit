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
		/**
		 * Share one state across this diagram and, say, an entity table beside it. Given one,
		 * the caller owns it: this component reads it and never calls `update`, exactly as
		 * `Graph` does — two owners writing one state fight on every render.
		 */
		state?: GraphState
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
		state: provided,
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

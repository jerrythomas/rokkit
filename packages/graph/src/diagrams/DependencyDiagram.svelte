<script lang="ts">
	/**
	 * What reads, writes, calls and contains what — the other half of a schema.
	 *
	 * dbd's v2 model splits `tables`/`refs` from `entities`/`deps` because an ER renderer
	 * wants one and a call-graph renderer wants the other. Pass
	 * `toGraphInput(model, 'dependencies')` and this draws the second.
	 *
	 * Keyed by RELATION rather than by kind: on this canvas the verb is the information, and
	 * `reads` versus `writes` is the distinction a reader is here for.
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
		/**
		 * Share one state across this diagram and, say, an entity table beside it. Given one,
		 * the caller owns it: this component reads it and never calls `update`, exactly as
		 * `Graph` does — two owners writing one state fight on every render.
		 */
		state?: GraphState
		nodes?: unknown[]
		edges?: unknown[]
		fields?: GraphFields
		density?: Density
		edgeStyle?: EdgeStyle
		groupTint?: boolean
		controls?: boolean
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
		state: provided,
		nodes = [],
		edges = [],
		fields = {},
		density = $bindable('names'),
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

	const config = () => ({
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
	<DensityControl {density} onchange={(v) => (density = v)} />
	<EdgeStyleControl {edgeStyle} onchange={(v) => (edgeStyle = v)} />
	<ZoomControl {zoom} onchange={(v) => (zoom = v)} />
{/snippet}

{#snippet legendBar()}
	<GraphLegend state={graph} relations kinds />
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

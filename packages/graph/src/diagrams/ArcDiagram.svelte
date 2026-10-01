<script lang="ts">
	/**
	 * Two relations over one shared, ordered axis (#169): the coupling the code declares on the
	 * left, the coupling the history reveals on the right.
	 *
	 * The finding is a pair with an arc on one side and none on the other — files that change
	 * together with nothing in the code tying them. The host flags those `hidden` (rokkit
	 * computes no history); `HiddenControl` shows only them. The legend is on by default: which
	 * side is which cannot be read off the arcs.
	 */
	import Graph from '../Graph.svelte'
	import GraphLegend from '../GraphLegend.svelte'
	import DiagramFrame from './DiagramFrame.svelte'
	import DrillBar from '../controls/DrillBar.svelte'
	import HiddenControl from '../controls/HiddenControl.svelte'
	import ZoomControl from '../controls/ZoomControl.svelte'
	import { GraphState } from '../GraphState.svelte.js'
	import type { GraphFields } from '../types.js'
	import type { GraphPreset } from '../preset.js'

	type Props = {
		/** Share one state with another view — see `DependencyDiagram`. */
		state?: GraphState
		nodes?: unknown[]
		edges?: unknown[]
		fields?: GraphFields
		/** The relation drawn on the right. Omitted, overlays go right and the rest left. */
		above?: string
		/** Every pair, or only the hidden ones. Bindable — the control moves it. */
		showEdges?: 'all' | 'hidden'
		/**
		 * The two sides' names in the legend, left then right. Omitted, they come from the data:
		 * the relations drawn on each side, else Declared / Observed from the locale.
		 */
		sideLabels?: [string, string]
		controls?: boolean
		/** On by default: the two sides are unreadable without a key. */
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
		above = undefined,
		showEdges = $bindable('all'),
		sideLabels = undefined,
		controls = false,
		legend = true,
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
		layout: 'arcs',
		above,
		showEdges,
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
		// A supplied state is the caller's — see DependencyDiagram.
		const { nodes: _n, edges: _e, fields: _f, preset: _p, mode: _m, value: _v, ...mine } =
			config()
		graph.apply(mine)
	})
</script>

{#snippet controlBar()}
	<DrillBar state={graph} />
	{#if controls}
		<HiddenControl {showEdges} onchange={(v) => (showEdges = v)} />
		<ZoomControl {zoom} onchange={(v) => (zoom = v)} />
	{/if}
{/snippet}

{#snippet legendBar()}
	<GraphLegend state={graph} sides={sideLabels ?? true} hidden />
{/snippet}

<DiagramFrame
	class={className}
	overlay={controls || graph.showsDrillBar ? controlBar : undefined}
	footer={legend ? legendBar : undefined}
>
	{#snippet canvas()}
		<Graph state={graph} bind:zoom arrows={false} />
	{/snippet}
</DiagramFrame>

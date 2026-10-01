<script lang="ts">
	/**
	 * Lanza & Marinescu's System Complexity view (#168): the containment tree, each file a box
	 * whose width, height and shade show three measures at once.
	 *
	 * `Treemap` encodes ONE measure as area; this encodes three, and the three-at-once is the
	 * point — a narrow, tall, dark box reads differently from a wide, short, pale one. Each
	 * channel is a prop and a picker, and the legend names them by default, because three
	 * encodings are unreadable without a key.
	 */
	import Graph from '../Graph.svelte'
	import GraphLegend from '../GraphLegend.svelte'
	import DiagramFrame from './DiagramFrame.svelte'
	import DrillBar from '../controls/DrillBar.svelte'
	import MeasureControl from '../controls/MeasureControl.svelte'
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
		/** What box WIDTH encodes: a `measures` key, `weight`, or `degree`. Bindable. */
		widthBy?: string
		/** What box HEIGHT encodes. Bindable. */
		heightBy?: string
		/** What box SHADE encodes; omit for no colour channel. Bindable. */
		colorBy?: string
		controls?: boolean
		/** On by default: three encodings are unreadable without a key. */
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
		widthBy = $bindable('weight'),
		heightBy = $bindable('weight'),
		colorBy = $bindable(undefined),
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
		layout: 'polymetric',
		widthBy,
		heightBy,
		colorBy,
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
		<MeasureControl channel="width" value={widthBy} options={graph.measureKeys} onchange={(v) => (widthBy = v ?? 'weight')} />
		<MeasureControl channel="height" value={heightBy} options={graph.measureKeys} onchange={(v) => (heightBy = v ?? 'weight')} />
		<MeasureControl channel="color" value={colorBy} options={graph.measureKeys} allowNone onchange={(v) => (colorBy = v)} />
		<ZoomControl {zoom} onchange={(v) => (zoom = v)} />
	{/if}
{/snippet}

{#snippet legendBar()}
	<GraphLegend state={graph} channels />
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

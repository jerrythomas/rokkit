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
	import DrillBar from '../controls/DrillBar.svelte'
	import MeasureControl from '../controls/MeasureControl.svelte'
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
		/** What area encodes. A `measures` key, or `weight`, or `degree`. */
		sizeBy?: string
		/** The measure — a 0..1 share — each box is shaded by (#164). Bindable; the picker moves it. */
		shadeBy?: string
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
		/**
		 * The reader opened a box — `path` is the new `focusPath`, `node` the declared node there
		 * (null for a synthesised container). Return a promise while you load that level; the
		 * canvas shows it pending, and a rejection returns to the previous level.
		 */
		ondrill?: (path: string[], node: GraphNode | null) => void | Promise<void>
		/** The reader climbed out; `path` is the new, shorter `focusPath`. */
		ondrillup?: (path: string[]) => void | Promise<void>
		class?: string
	}

	let {
		state: provided,
		nodes = [],
		edges = [],
		fields = {},
		sizeBy = 'weight',
		shadeBy = $bindable(undefined),
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
		ondrill = undefined,
		ondrillup = undefined,
		class: className = ''
	}: Props = $props()

	let zoom = $state(1)

	const config = () => ({
		nodes,
		edges,
		fields,
		layout: 'world',
		sizeBy,
		shadeBy,
		levels,
		focusPath,
		value,
		preset,
		mode,
		label,
		onselect,
		ondrill,
		ondrillup,
		// Drilling moves focusPath inside the state; keep the bindable prop in step, or the next
		// update() would put the old value back.
		onfocuspath: (path: string[]) => (focusPath = path)
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
		// The drill path too: a caller's state holds where the reader drilled, and pushing this
		// component's own focusPath prop back over it undid the drill on any prop change.
		const {
			nodes: _n,
			edges: _e,
			fields: _f,
			preset: _p,
			mode: _m,
			value: _v,
			focusPath: _fp,
			onfocuspath: _sync,
			...mine
		} = config()
		graph.apply(mine)
	})
</script>

<!-- Snippets are declared OUTSIDE the frame and passed conditionally: one declared
     inside is always defined, so the frame would render an empty control bar over
     every diagram that asked for none. -->
{#snippet controlBar()}
	<DrillBar state={graph} />
	{#if controls}
		<DepthControl {levels} max={maxLevels} onchange={(v) => (levels = v)} />
		<MeasureControl channel="color" value={shadeBy} options={graph.measureKeys} allowNone onchange={(v) => (shadeBy = v)} />
		<ZoomControl {zoom} onchange={(v) => (zoom = v)} />
	{/if}
{/snippet}

{#snippet legendBar()}
	<GraphLegend state={graph} groups shade />
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

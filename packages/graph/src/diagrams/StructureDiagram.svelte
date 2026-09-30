<script lang="ts">
	/**
	 * A codebase as a radial dendrogram, with its calls bundled through the structure.
	 *
	 * What `CallTree` cannot be over a real repo. A call graph's own spanning tree has hundreds
	 * of roots, so capping its depth prunes almost nothing and the rim comes out a grey smear.
	 * Containment — crate, module, file — is a real tree with one root, which is what makes
	 * "show two levels, then drill" mean something.
	 *
	 * The calls are drawn ON that tree rather than defining it, bundled so edges travelling the
	 * same way through the hierarchy pull together. `bundleTension` is the Straight/Bundled
	 * toggle: 0 is a plain chord, 0.85 the full route.
	 */
	import Graph from '../Graph.svelte'
	import GraphLegend from '../GraphLegend.svelte'
	import DiagramFrame from './DiagramFrame.svelte'
	import DepthControl from '../controls/DepthControl.svelte'
	import DrillBar from '../controls/DrillBar.svelte'
	import BundleControl from '../controls/BundleControl.svelte'
	import ZoomControl from '../controls/ZoomControl.svelte'
	import { GraphState } from '../GraphState.svelte.js'
	import type { GraphFields, GraphNode } from '../types.js'
	import type { GraphPreset } from '../preset.js'

	type Props = {
		/** Share one state with views beside this one. See `ErDiagram` for the contract. */
		state?: GraphState
		nodes?: unknown[]
		edges?: unknown[]
		fields?: GraphFields
		/** How many ancestor bands to draw, counting from the focus. */
		levels?: number
		/** The subtree to render as the whole canvas. `[]` is the root. Drilling, not zooming. */
		focusPath?: string[]
		/** How hard edges are pulled onto the tree, 0..1. 0 is a straight chord. */
		bundleTension?: number
		/** What a leaf's dot is sized by. */
		sizeBy?: string
		sizeScale?: 'linear' | 'log'
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
		levels = $bindable(2),
		focusPath = $bindable([]),
		bundleTension = $bindable(0.85),
		sizeBy = 'degree',
		sizeScale = 'linear',
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
		layout: 'structure',
		levels,
		focusPath,
		bundleTension,
		sizeBy,
		sizeScale,
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
		<DepthControl {levels} max={maxLevels} onchange={(v) => (levels = v)} />
		<BundleControl {bundleTension} onchange={(v) => (bundleTension = v)} />
		<ZoomControl {zoom} onchange={(v) => (zoom = v)} />
	{/if}
{/snippet}

{#snippet legendBar()}
	<GraphLegend state={graph} relations groups />
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

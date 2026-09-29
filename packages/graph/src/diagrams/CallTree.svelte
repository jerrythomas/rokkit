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
	import ZoomControl from '../controls/ZoomControl.svelte'
	import { GraphState } from '../GraphState.svelte.js'
	import type { GraphFields } from '../types.js'
	import type { GraphPreset } from '../preset.js'

	type Props = {
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
		class?: string
	}

	let {
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
	<DepthControl levels={levels ?? maxLevels} max={maxLevels} onchange={(v) => (levels = v)} />
	<ZoomControl {zoom} onchange={(v) => (zoom = v)} />
{/snippet}

{#snippet legendBar()}
	<GraphLegend state={graph} kinds />
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

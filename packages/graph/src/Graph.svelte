<script lang="ts">
	import { setContext, untrack } from 'svelte'
	import { GraphState } from './GraphState.svelte.js'
	import type { GraphStateConfig } from './GraphState.svelte.js'
	import type { GraphProps } from './types.js'

	/** Icon class per node kind, keyed by the closed `data-node-kind` vocabulary. */
	const defaultIcons: Record<string, string> = {
		table: 'i-graph-table',
		view: 'i-graph-view',
		matview: 'i-graph-matview',
		function: 'i-graph-function',
		procedure: 'i-graph-procedure',
		enum: 'i-graph-enum',
		pk: 'i-graph-key',
		fk: 'i-graph-link',
		uq: 'i-graph-unique',
		nn: 'i-graph-required',
		fallback: 'i-graph-node'
	}

	// Aliased: a local binding literally named `state` makes the compiler read the `$state`
	// rune below as a store subscription on it. The PUBLIC prop name is still `state`.
	let {
		state: provided,
		nodes = [],
		edges = [],
		fields = {},
		layout = 'cluster',
		density = 'keys',
		arrange = 'untangle',
		edgeStyle = 'curved',
		focus = null,
		value = undefined,
		preset = undefined,
		mode = 'light',
		label = undefined,
		onselect = undefined,
		icons: userIcons = undefined,
		class: className = ''
	}: GraphProps = $props()

	// A getter thunk (not a plain object) so every reactive prop it closes over is re-read on
	// each call — used both by the untracked initial construction and the live $effect below.
	const config = (): GraphStateConfig => ({
		nodes,
		edges,
		fields,
		layout,
		density,
		arrange,
		edgeStyle,
		focus,
		value,
		preset,
		mode,
		label,
		onselect
	})

	// untrack: the constructor's initial read must not register as a dependency of whatever
	// scope creates <Graph> — mirrors Spark's `untrack(() => new SparkState(config()))`.
	const own = untrack(() => new GraphState(config()))

	// Resolved ONCE, not $derived. setContext runs a single time at init and captures the value
	// it is handed, so publishing a $derived would put whichever object won the branch at that
	// instant into context forever — a caller later swapping `state` (or going from none to one)
	// would leave nested EntityView/EntitiesView reading the stale object, silently.
	//
	// PlotState and SparkState hold the same discipline: reactivity flows through mutating ONE
	// object's $state fields, never through replacing which object is in context.
	// svelte-ignore state_referenced_locally
	const graph = provided ?? own

	setContext('graph-state', graph)

	// Only sync the state WE own. A caller-supplied state is theirs to drive.
	$effect(() => {
		if (!provided) own.update(config())
	})

	const icons = $derived<Record<string, string>>({ ...defaultIcons, ...userIcons })

	// Static fit-to-container (no pan/zoom in slice 1). These stay in the component because
	// they depend on the rendered viewport, which state cannot know. The content extent they
	// divide by is `graph.contentSize` — a pure derivation, so it lives in state.
	const PAD = 28
	let vw = $state(0)
	let vh = $state(0)
	const scale = $derived(
		Math.max(
			0.08,
			Math.min((vw - PAD * 2) / graph.contentSize.w, (vh - PAD * 2) / graph.contentSize.h, 1)
		) || 0.5
	)
	const tx = $derived((vw - graph.contentSize.w * scale) / 2)
	const ty = $derived((vh - graph.contentSize.h * scale) / 2)
</script>

<!-- The viewport fills its nearest positioned ancestor. Place it inside a `relative` box
     with a height.

     The accessible name lives on the <svg> below, NOT here: role="img" makes its whole
     subtree presentational, so putting it on this root would hide every node button from
     assistive tech. The svg holds only edge geometry, which is genuinely one graphic.

     role="presentation" is what this is — a positioned surface. Click-the-background-to-
     dismiss is not the only way out: Escape does the same, and every node is a real
     <button>, so nothing here is keyboard-inaccessible. -->
<div
	data-graph-paper
	role="presentation"
	class={className}
	bind:clientWidth={vw}
	bind:clientHeight={vh}
	onclick={() => graph.clear()}
	onkeydown={(e) => e.key === 'Escape' && graph.clear()}
	tabindex="-1"
>
	<div
		data-graph-world
		style="width: {graph.size.w}px; height: {graph.size.h}px; transform: translate({tx}px, {ty}px) scale({scale});"
	>
		{#each graph.clusters as cluster (cluster.name)}
			<div
				data-graph-cluster
				data-node-group={cluster.name}
				style:left="{cluster.x}px"
				style:top="{cluster.y}px"
				style:width="{cluster.w}px"
				style:height="{cluster.h}px"
				style={Object.entries(graph.groupStyle(cluster.name))
					.map(([k, v]) => `${k}:${v}`)
					.join(';')}
			>
				<span data-graph-cluster-label>{cluster.name} · {cluster.count}</span>
			</div>
		{/each}

		<svg
			width={graph.size.w}
			height={graph.size.h}
			role="img"
			aria-label={graph.label}
			style="position: absolute; top: 0; left: 0; pointer-events: none;"
		>
			<title>{graph.label}</title>
			{#each graph.routedEdges as edge (edge.id)}
				<g data-graph-edge data-edge-kind={edge.kind} data-edge-state={graph.edgeState(edge)}>
					<path d={graph.edgePath(edge)} />
					<circle data-graph-edge-dot="from" cx={edge.x1} cy={edge.y1} r="3.2" />
					<circle data-graph-edge-dot="to" cx={edge.x2} cy={edge.y2} r="3.2" />
				</g>
			{/each}
		</svg>

		{#each Object.entries(graph.cards) as [key, card] (key)}
			<button
				type="button"
				data-graph-node={key}
				data-node-kind={card.node.kind}
				data-node-group={card.node.group}
				data-node-state={graph.nodeState(key)}
				data-node-headonly={card.vis.length === 0 && card.more <= 0 ? '' : undefined}
				style:left="{card.x}px"
				style:top="{card.y}px"
				style:width="{card.w}px"
				style={Object.entries(graph.groupStyle(card.node.group))
					.map(([k, v]) => `${k}:${v}`)
					.join(';')}
				onclick={(event) => {
					event.stopPropagation()
					graph.select(key)
				}}
			>
				<span data-graph-node-head>
					<span data-graph-node-icon class={icons[card.node.kind ?? ''] ?? icons.fallback}></span>
					<span data-graph-node-title>{card.node.label}</span>
					<span data-graph-node-count>{card.node.rows.length}</span>
				</span>
				{#each card.vis as row (row.name)}
					<span data-graph-row data-graph-row-key={row.badges.length > 0 ? '' : undefined}>
						{#if row.badges.length > 0}
							<span data-row-badge={row.badges[0]} class={icons[row.badges[0]]}></span>
						{:else}
							<span data-row-badge-empty></span>
						{/if}
						<span data-graph-row-name>{row.name}</span>
						<span data-graph-row-type>{row.type}</span>
					</span>
				{/each}
				{#if card.more > 0}
					<span data-graph-more>+ {card.more} more</span>
				{/if}
			</button>
		{/each}
	</div>
</div>

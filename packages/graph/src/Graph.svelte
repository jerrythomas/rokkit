<script lang="ts">
	import { setContext, untrack } from 'svelte'
	import { GraphState } from './GraphState.svelte.js'
	import type { GraphStateConfig } from './GraphState.svelte.js'
	import type { GraphProps } from './types.js'
	import { DEFAULT_ICONS } from './icons.js'
	import { nextZoom } from './controls/zoom.js'
	import { interactions } from './actions/interactions.js'
	import { canvasNavigation } from './actions/canvas.js'
	import { say } from './messages.js'
	import { readable } from './state/text.js'

	// Aliased: a local binding literally named `state` makes the compiler read the `$state`
	// rune below as a store subscription on it. The PUBLIC prop name is still `state`.
	let {
		state: provided,
		nodes = [],
		edges = [],
		fields = {},
		layout = 'flow',
		density = $bindable('keys'),
		arrange = 'untangle',
		groupBy = 'group',
		groupTint = false,
		nestBy = undefined,
		sizeBy = 'degree',
		sizeScale = 'linear',
		edgeStyle = 'curved',
		focus = null,
		value = undefined,
		preset = undefined,
		mode = 'light',
		zoom = $bindable(1),
		zoomable = true,
		arrows = true,
		label = undefined,
		onselect = undefined,
		focusPath = $bindable([]),
		ondrill = undefined,
		ondrillup = undefined,
		onexpand = undefined,
		oncollapse = undefined,
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
		groupBy,
		groupTint,
		nestBy,
		sizeBy,
		sizeScale,
		edgeStyle,
		focus,
		value,
		preset,
		mode,
		label,
		onselect,
		focusPath,
		ondrill,
		ondrillup,
		onexpand,
		oncollapse,
		// Drilling moves focusPath inside the state; keep the bindable prop in step, or the next
		// update() would put the old value back.
		onfocuspath: (path) => (focusPath = path)
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

	const icons = $derived<Record<string, string>>({ ...DEFAULT_ICONS, ...userIcons })

	// Fit-to-container, multiplied by `zoom`. These stay in the component because they depend
	// on the rendered viewport, which state cannot know. The content extent they divide by is
	// `graph.contentSize` — a pure derivation, so it lives in state.
	//
	// `fit` alone shrinks a real schema until its labels are unreadable, which is the whole
	// reason zoom exists.
	const PAD = 28

	let vw = $state(0)
	let vh = $state(0)
	let paper = $state<HTMLElement | null>(null)

	const onzoom = (direction: 'in' | 'out') => (zoom = nextZoom(zoom, direction))

	const fit = $derived(
		Math.max(
			0.08,
			Math.min((vw - PAD * 2) / graph.contentSize.w, (vh - PAD * 2) / graph.contentSize.h, 1)
		) || 0.5
	)
	const scale = $derived(fit * zoom)
	// Centre while the content is smaller than the viewport; once it is larger, pin to a
	// padding offset so scrolling reaches the far edge instead of clipping it.
	const tx = $derived(Math.max(PAD, (vw - graph.contentSize.w * scale) / 2))
	const ty = $derived(Math.max(PAD, (vh - graph.contentSize.h * scale) / 2))

	/**
	 * Level of detail, from the EFFECTIVE scale rather than from `zoom` — a diagram fitted to
	 * 0.05 is unreadable whether or not the reader touched the zoom control.
	 *
	 * Measured on a 1000-node call graph fitted into 1440x900: scale 0.047, so a 248px card
	 * renders 11.6px wide and a 12px label lands at 0.56px. Drawing that text costs layout
	 * and paint for glyphs nobody can see, so each tier drops what has stopped being legible
	 * and the card keeps its colour, shape and position — which is what still reads at that
	 * size. Hovering a node brings its label back at any tier.
	 */
	const detail = $derived(
		scale >= 0.6 ? 'full' : scale >= 0.32 ? 'compact' : scale >= 0.14 ? 'minimal' : 'dot'
	)
</script>

<!-- The viewport fills its nearest positioned ancestor. Place it inside a `relative` box
     with a height.

     The accessible name lives on the <svg> below, NOT here: role="img" makes its whole
     subtree presentational, so putting it on this root would hide every node button from
     assistive tech. The svg holds only edge geometry, which is genuinely one graphic.

     role="presentation" is what this is — a positioned surface. Click-the-background-to-
     dismiss is not the only way out: Escape does the same, and every node is a real
     <button>, so nothing here is keyboard-inaccessible. -->
<div data-graph-viewport class={className}>
	<div
		data-graph-paper
		data-graph-detail={detail}
		data-graph-group-tint={graph.groupTint ? '' : undefined}
		data-graph-pending={graph.pending ? '' : undefined}
		aria-busy={graph.pending}
		role="presentation"
		bind:this={paper}
		bind:clientWidth={vw}
		bind:clientHeight={vh}
		use:interactions={{ state: graph, clearOnBackground: true }}
		use:canvasNavigation={{ zoomable, onzoom }}
		tabindex="-1"
	>
		<div
			data-graph-world
			data-graph-node-shape={graph.nodeShape}
			data-graph-layout={graph.layoutName}
			style="width: {graph.size.w}px; height: {graph.size
				.h}px; transform: translate({tx}px, {ty}px) scale({scale}); --graph-label-counter-scale: {(
				1 / scale
			).toFixed(3)};"
		>
			<!-- Column headings. Three columns get away without them — the focus is visibly
		     central — but a depth-2 portrait is five columns and ambiguous without one.
		     Position, width and wording all come from the layout; this only prints them. -->
			{#each graph.columns as column (column.side + column.depth)}
				<span
					data-graph-column
					data-column-side={column.side}
					data-column-depth={column.depth}
					style:left="{column.x}px"
					style:width="{column.w}px">{column.label}</span
				>
			{/each}

			<!-- A wedge cannot be a positioned <div> — an annulus sector has no box. It is drawn in
		     its own SVG UNDER the boxes, so a sunburst renders through the same cluster list as
		     every other containment layout and nothing downstream learns a second vocabulary. -->
			{#if graph.hasWedges}
				<svg
					data-graph-wedges
					width={graph.size.w}
					height={graph.size.h}
					role="img"
					aria-label={graph.label}
					style="position: absolute; top: 0; left: 0;"
				>
					<title>{graph.label}</title>
					{#each graph.clusters as cluster (graph.clusterKey(cluster))}
						<!-- Two branches so `role` is STATIC: an interactive wedge is a button and says so;
						     a region is scenery. What a press on it means comes from state, in the
						     shared attributes, and the canvas's one `interactions` action acts on it. -->
						{#if graph.interactive(cluster)}
							<path
								data-graph-wedge
								{...graph.boxAttrs(cluster)}
								style={graph.boxStyleAttr(cluster)}
								d={graph.wedgePath(cluster)}
								role="button"
								tabindex={0}><title>{graph.caption(cluster)}</title></path
							>
						{:else}
							<path
								data-graph-wedge
								{...graph.boxAttrs(cluster)}
								style={graph.boxStyleAttr(cluster)}
								d={graph.wedgePath(cluster)}><title>{graph.caption(cluster)}</title></path
							>
						{/if}
					{/each}
				</svg>
			{/if}

			{#each graph.boxes as cluster (graph.clusterKey(cluster))}
				<!-- One box shape at every depth: a containment layout nests boxes inside boxes, so a
			     childless one is still a box, not a node card.

			     Two branches, not one element with a conditional tag: an interactive box is a real
			     <button> and gets Enter/Space, focus order and the right announcement for free; a
			     region is scenery and is a <div> that says so. What its press means — select a leaf,
			     open a container — comes from state in the shared attributes. -->
				{#if graph.interactive(cluster)}
					<button
						type="button"
						data-graph-cluster
						{...graph.boxAttrs(cluster)}
						style:left="{cluster.x}px"
						style:top="{cluster.y}px"
						style:width="{cluster.w}px"
						style:height="{cluster.h}px"
						style={graph.boxStyleAttr(cluster)}
						style:--shade={cluster.shade}
					>
						<span data-graph-cluster-label>{graph.caption(cluster)}</span>
					</button>
				{:else}
					<div
						data-graph-cluster
						{...graph.boxAttrs(cluster)}
						style:left="{cluster.x}px"
						style:top="{cluster.y}px"
						style:width="{cluster.w}px"
						style:height="{cluster.h}px"
						style={graph.boxStyleAttr(cluster)}
					>
						<span data-graph-cluster-label>{graph.caption(cluster)}</span>
					</div>
				{/if}
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
					<g
						data-graph-edge
						data-edge-kind={edge.kind}
						data-edge-relation={edge.relation}
						data-edge-from={edge.fromKey}
						data-edge-to={edge.toKey}
						data-edge-state={graph.edgeState(edge)}
						data-edge-overlay={edge.overlay ? '' : undefined}
						data-edge-weakest={edge.weakest ? '' : undefined}
						data-edge-hidden={edge.hidden ? '' : undefined}
						data-edge-side={edge.side}
						data-edge-conformance={edge.conformance}
						data-edge-count={edge.count}
						style:--edge-weight={graph.edgeWeight(edge)}
					>
						<path d={graph.edgePath(edge)} />
						<circle data-graph-edge-dot="from" cx={edge.x1} cy={edge.y1} r="3.2" />
						{#if arrows}
							<!-- An edge HAS a direction — source to target — and two identical dots threw
						     that away. The tangent of both path shapes is horizontal at the endpoint,
						     so the heading is just the side the curve arrives from: -s2. No angle
						     maths, and it stays correct for a self-loop. -->
							{@const d = -edge.s2}
							<polygon
								data-graph-edge-arrow
								points="{edge.x2},{edge.y2} {edge.x2 - d * 9},{edge.y2 - 4.5} {edge.x2 -
									d * 9},{edge.y2 + 4.5}"
							/>
						{:else}
							<circle data-graph-edge-dot="to" cx={edge.x2} cy={edge.y2} r="3.2" />
						{/if}
					</g>
				{/each}
			</svg>

			{#each Object.entries(graph.cards) as [key, card] (key)}
				<button
					type="button"
					data-graph-node={key}
					{...graph.cardAttrs(key)}
					data-label-side={card.labelSide}
					style:--label-angle={card.labelAngle === undefined ? undefined : `${card.labelAngle}deg`}
					style:left="{card.x}px"
					style:top="{card.y}px"
					style:width="{card.w}px"
					style:height="{card.h}px"
					style={graph.groupStyleAttr(card.node.group)}
				>
					<span data-graph-node-head>
						<span data-graph-node-icon class={icons[card.node.kind ?? ''] ?? icons.fallback}></span>
						<span data-graph-node-title>{card.node.label}</span>
						{#if card.node.kind}
							<!-- The glyph alone is a guess: layers vs eye vs bolt does not tell anyone what a
						     materialized view is. Icon for the glance, tag for the answer. Underscores
						     are the WIRE format (dbd sends `materialized_view`), not something to
						     read. -->
							<span data-graph-node-kind>{readable(card.node.kind)}</span>
						{/if}
						<!-- A group counts what it stands for; a table counts its rows. -->
						<span data-graph-node-count>{graph.cardCount(key)}</span>
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
					{#if graph.isCollapsed(key)}
						<!-- The way in, as a real control inside the card — the same pattern as "+3 more":
						     the card's own press still selects, this one expands. -->
						<span
							role="button"
							tabindex="0"
							data-graph-group-toggle
							data-graph-press="group"
							data-graph-key={key}
							aria-label={say('expand', { name: card.node.label })}
							>{say('expandCount', { n: graph.memberCount(key) })}</span
						>
					{/if}
					{#if graph.moreLabel(key)}
						<!-- A real control. "+3 more" that does nothing is a statement dressed as an
					     affordance; this expands just this card. -->
						<span role="button" tabindex="0" data-graph-more {...graph.moreAttrs(key)}
							>{graph.moreLabel(key)}</span
						>
					{/if}
				</button>
			{/each}
		</div>
	</div>
</div>

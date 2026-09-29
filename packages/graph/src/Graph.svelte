<script lang="ts">
	import { setContext, untrack } from 'svelte'
	import { GraphState } from './GraphState.svelte.js'
	import type { GraphStateConfig } from './GraphState.svelte.js'
	import type { GraphProps } from './types.js'
	import { DEFAULT_ICONS } from './icons.js'
	import { ZOOM_STEP, clampZoom } from './controls/zoom.js'

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

	function zoomBy(factor: number) {
		zoom = clampZoom(zoom * factor)
	}

	/**
	 * Ctrl/meta + wheel is what a trackpad pinch reports as. Without preventDefault the
	 * browser zooms the whole PAGE instead of the diagram, which is the behaviour a reader
	 * hits first and reads as the component ignoring them.
	 *
	 * A plain wheel is left alone: the canvas scrolls, which is how panning works here.
	 */
	function onWheel(event: WheelEvent) {
		if (!zoomable || !(event.ctrlKey || event.metaKey)) return
		event.preventDefault()
		zoomBy(event.deltaY < 0 ? ZOOM_STEP : 1 / ZOOM_STEP)
	}

	// Drag-to-pan on the background. Scrolling already reaches the overflow, so this is the
	// direct-manipulation path on top of it, not the only way across.
	let panning = $state(false)
	let panFrom = { x: 0, y: 0, left: 0, top: 0 }

	function onPointerDown(event: PointerEvent) {
		// Only the background drags — a press that starts on a card is a selection.
		if (!paper || (event.target as HTMLElement).closest('[data-graph-node]')) return
		panning = true
		panFrom = { x: event.clientX, y: event.clientY, left: paper.scrollLeft, top: paper.scrollTop }
		paper.setPointerCapture(event.pointerId)
	}

	function onPointerMove(event: PointerEvent) {
		if (!panning || !paper) return
		paper.scrollLeft = panFrom.left - (event.clientX - panFrom.x)
		paper.scrollTop = panFrom.top - (event.clientY - panFrom.y)
	}

	function endPan() {
		panning = false
	}

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
		data-graph-panning={panning ? '' : undefined}
		role="presentation"
		bind:this={paper}
		bind:clientWidth={vw}
		bind:clientHeight={vh}
		onclick={() => graph.clear()}
		onkeydown={(e) => e.key === 'Escape' && graph.clear()}
		onwheel={onWheel}
		onpointerdown={onPointerDown}
		onpointermove={onPointerMove}
		onpointerup={endPan}
		onpointercancel={endPan}
		tabindex="-1"
	>
	<div
		data-graph-world
		data-graph-node-shape={graph.nodeShape}
		data-graph-layout={graph.layoutName}
		style="width: {graph.size.w}px; height: {graph.size.h}px; transform: translate({tx}px, {ty}px) scale({scale}); --graph-label-counter-scale: {(1 / scale).toFixed(3)};"
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
					{@const shared = graph.boxAttrs(cluster)}
					{@const caption = `${cluster.name} · ${cluster.caption ?? cluster.count}`}
					<!-- Two branches so `role` is STATIC. A wedge that is a node is a button and says
					     so; a region is scenery. Written as one element with a conditional role, the
					     compiler cannot tell which it is and neither can a screen reader. The shared
					     attributes come from state, so the branches cannot drift apart. -->
					{#if cluster.nodeId}
						<path
							data-graph-wedge
							{...shared}
							style={graph.groupStyleAttr(cluster.ramp ?? cluster.name)}
							d={graph.wedgePath(cluster)}
							role="button"
							tabindex={0}
							aria-label={caption}
							onclick={(event: Event) => {
								event.stopPropagation()
								graph.select(cluster.nodeId!)
							}}
							onkeydown={(event: KeyboardEvent) => {
								if (event.key !== 'Enter' && event.key !== ' ') return
								event.preventDefault()
								event.stopPropagation()
								graph.select(cluster.nodeId!)
							}}><title>{caption}</title></path
						>
					{:else}
						<path
							data-graph-wedge
							{...shared}
							style={graph.groupStyleAttr(cluster.ramp ?? cluster.name)}
							d={graph.wedgePath(cluster)}><title>{caption}</title></path
						>
					{/if}
				{/each}
			</svg>
		{/if}

		{#each graph.boxes as cluster (graph.clusterKey(cluster))}
			{@const shared = graph.boxAttrs(cluster)}
			{@const caption = `${cluster.name} · ${cluster.caption ?? cluster.count}`}
			<!-- One box shape at every depth. A containment layout nests boxes inside boxes, so a
			     childless one is still a box — rendering it as a node CARD instead put two
			     structures in one hierarchy and brought the card's furniture with it, down to a
			     row count that is `0` for anything without rows.

			     Two branches, not one element with a conditional tag: a leaf is clickable and
			     focusable, so it is a real <button> and gets Enter/Space, focus order and the right
			     announcement for free. A region is scenery and is a <div> that says so. The shared
			     attributes come from state, so the two cannot drift. -->
			{#if cluster.nodeId}
				<button
					type="button"
					data-graph-cluster
					{...shared}
					style:left="{cluster.x}px"
					style:top="{cluster.y}px"
					style:width="{cluster.w}px"
					style:height="{cluster.h}px"
					style={graph.groupStyleAttr(cluster.ramp ?? cluster.name)}
					onclick={(event) => {
						event.stopPropagation()
						graph.select(cluster.nodeId!)
					}}
				>
					<span data-graph-cluster-label>{caption}</span>
				</button>
			{:else}
				<div
					data-graph-cluster
					{...shared}
					style:left="{cluster.x}px"
					style:top="{cluster.y}px"
					style:width="{cluster.w}px"
					style:height="{cluster.h}px"
					style={graph.groupStyleAttr(cluster.ramp ?? cluster.name)}
				>
					<span data-graph-cluster-label>{caption}</span>
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
				data-node-kind={card.node.kind}
				data-node-group={card.node.group}
				data-node-state={graph.nodeState(key)}
				data-node-headonly={card.vis.length === 0 && card.more <= 0 ? '' : undefined}
				style:left="{card.x}px"
				style:top="{card.y}px"
				style:width="{card.w}px"
				style:height="{card.h}px"
				style={graph.groupStyleAttr(card.node.group)}
				onclick={(event) => {
					event.stopPropagation()
					graph.select(key)
				}}
			>
				<span data-graph-node-head>
					<span data-graph-node-icon class={icons[card.node.kind ?? ''] ?? icons.fallback}></span>
					<span data-graph-node-title>{card.node.label}</span>
					{#if card.node.kind}
						<!-- The glyph alone is a guess: layers vs eye vs bolt does not tell anyone what a
						     materialized view is. Icon for the glance, tag for the answer. Underscores
						     are the WIRE format (dbd sends `materialized_view`), not something to
						     read. -->
						<span data-graph-node-kind>{card.node.kind.replace(/_/g, ' ')}</span>
					{/if}
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
				{#if graph.moreLabel(key)}
					<!-- A real control. "+3 more" that does nothing is a statement dressed as an
					     affordance; this expands just this card. -->
					<span
						role="button"
						tabindex="0"
						data-graph-more
						data-graph-more-empty={card.vis.length === 0 && !graph.isExpanded(key)
							? ''
							: undefined}
						data-expanded={graph.isExpanded(key) ? '' : undefined}
						onclick={(event) => {
							event.stopPropagation()
							graph.toggleExpanded(key)
						}}
						onkeydown={(event) => {
							if (event.key !== 'Enter' && event.key !== ' ') return
							event.preventDefault()
							event.stopPropagation()
							graph.toggleExpanded(key)
						}}
					>{graph.moreLabel(key)}</span
					>
				{/if}
			</button>
		{/each}
		</div>
	</div>

</div>

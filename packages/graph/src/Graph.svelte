<script lang="ts">
	import { setContext, untrack } from 'svelte'
	import { GraphState } from './GraphState.svelte.js'
	import type { GraphStateConfig } from './GraphState.svelte.js'
	import type { GraphProps } from './types.js'
	import { DEFAULT_ICONS } from './icons.js'

	// Aliased: a local binding literally named `state` makes the compiler read the `$state`
	// rune below as a store subscription on it. The PUBLIC prop name is still `state`.
	let {
		state: provided,
		nodes = [],
		edges = [],
		fields = {},
		layout = 'cluster',
		density = $bindable('keys'),
		arrange = 'untangle',
		groupBy = 'group',
		nestBy = undefined,
		edgeStyle = 'curved',
		focus = null,
		value = undefined,
		preset = undefined,
		mode = 'light',
		zoom = $bindable(1),
		zoomable = true,
		densityToggle = true,
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
		nestBy,
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
	const ZOOM_MIN = 0.25
	const ZOOM_MAX = 4
	const ZOOM_STEP = 1.25

	let vw = $state(0)
	let vh = $state(0)
	let paper = $state<HTMLElement | null>(null)

	const clampZoom = (value: number) => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, value))

	/**
	 * Writes the STATE, then mirrors into the bindable prop. Both halves matter: the state is
	 * what renders (and may be caller-supplied, where the prop never reaches it), and the
	 * prop is what a `bind:density` consumer observes — without the mirror its own effect
	 * would re-apply the stale value and undo the click.
	 */
	function setDensity(next: typeof density) {
		graph.setDensity(next)
		density = next
	}

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
	const zoomPercent = $derived(Math.round(zoom * 100))

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
		data-graph-layout={graph.layoutName}
		style="width: {graph.size.w}px; height: {graph.size.h}px; transform: translate({tx}px, {ty}px) scale({scale}); --graph-label-counter-scale: {(1 / scale).toFixed(3)};"
	>
		{#each graph.clusters as cluster (graph.clusterKey(cluster))}
			<div
				data-graph-cluster
				data-cluster-depth={cluster.depth ?? 0}
				data-node-group={cluster.name}
				style:left="{cluster.x}px"
				style:top="{cluster.y}px"
				style:width="{cluster.w}px"
				style:height="{cluster.h}px"
				style={graph.groupStyleAttr(cluster.name)}
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

	{#if densityToggle}
		<!-- On the canvas for the same reason zoom is: "+3 more" tells a reader something is
		     hidden; this is the control that does something about it for every card at once. -->
		<div data-graph-density-controls role="group" aria-label="Detail level">
			{#each [['names', 'Names', 'Titles only'], ['keys', 'Keys', 'Key rows only'], ['full', 'All', 'All rows']] as [value, short, title] (value)}
				<button
					type="button"
					data-graph-density={value}
					data-selected={graph.density === value ? '' : undefined}
					aria-pressed={graph.density === value}
					{title}
					onclick={() => setDensity(value as typeof density)}>{short}</button
				>
			{/each}
		</div>
	{/if}

	{#if zoomable}
		<!-- On-canvas, because a zoom control that lives in someone else's settings drawer is
		     a control a reader never finds. Buttons rather than a slider: each is one tab stop
		     and one keypress, so this works without a trackpad. -->
		<div data-graph-zoom-controls>
			<button
				type="button"
				data-graph-zoom="out"
				aria-label="Zoom out"
				disabled={zoom <= ZOOM_MIN}
				onclick={() => zoomBy(1 / ZOOM_STEP)}>−</button
			>
			<button type="button" data-graph-zoom="reset" aria-label="Reset zoom to fit" onclick={() => (zoom = 1)}
				>{zoomPercent}%</button
			>
			<button
				type="button"
				data-graph-zoom="in"
				aria-label="Zoom in"
				disabled={zoom >= ZOOM_MAX}
				onclick={() => zoomBy(ZOOM_STEP)}>+</button
			>
		</div>
	{/if}
</div>

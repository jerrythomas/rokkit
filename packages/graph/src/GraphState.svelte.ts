import { SvelteSet } from 'svelte/reactivity'
import { normalizeGraph } from './model/normalize.js'
import { layouts } from './layout/index.js'
import { edgePath } from './layout/edges.js'
import { nodeShapeOf } from './layout/options.js'
import { arcPath } from './layout/arc.js'
import { defaultGraphPreset, resolveGroupStyles } from './preset.js'
import type { GraphPreset } from './preset.js'
import type {
	Arrange,
	Cards,
	Cluster,
	Column,
	Density,
	EdgeStyle,
	LayoutFn,
	NodeAxis,
	RoutedEdge,
	Size
} from './layout/types.js'
import type { GraphEdge, GraphFields, GraphModel, GraphNode } from './types.js'

export type EntityRow = {
	id: string
	label: string
	group?: string
	kind?: string
	rowCount: number
	refCount: number
	note?: string
}

export type Relationship = {
	direction: 'in' | 'out'
	id: string
	label: string
	group?: string
	/** The canonical edge — always present. A relationship is a fact about the model. */
	edge: GraphEdge
	/** Routed geometry, present only when the ACTIVE layout placed this edge. */
	routed?: RoutedEdge
}

export type GraphStateConfig = {
	nodes?: unknown[]
	edges?: unknown[]
	fields?: GraphFields
	layout?: string | LayoutFn
	density?: Density
	arrange?: Arrange
	/** Outer grouping axis. Defaults to `group` (the schema, for dbd data). */
	groupBy?: NodeAxis
	/** Second axis subdividing each outer cluster. Unset means one level. */
	nestBy?: NodeAxis | null
	/**
	 * `points` only — what a node's size encodes. `degree` (default), `weight`, or any key in
	 * `GraphNode.measures`.
	 */
	sizeBy?: string
	/** How the measure maps onto area. Defaults to `linear`. */
	sizeScale?: 'linear' | 'log'
	/** `neighborhood` only — hops out from the focus. Defaults to 1. */
	depth?: number
	/** `world` only — the subtree rendered as the whole canvas. `[]` is the root. */
	focusPath?: string[]
	/** `world` only — levels below the focus to materialise. Defaults to 2. */
	levels?: number
	/** `radial` only — `tree` ranks by depth, `dendrogram` pins leaves to the rim. */
	radialMode?: 'tree' | 'dendrogram'
	/** `radial` only — the node to centre on. Drilling; NOT the selection. */
	root?: string | null
	/**
	 * Paint each CARD with its group's ramp, not just the cluster box around it.
	 *
	 * A clusterless layout — `flow`, `neighborhood` — has no box for the ramp to land on,
	 * so schema membership becomes invisible the moment you leave `cluster`. The cards
	 * already carry the custom properties; this is what tells CSS to use them.
	 */
	groupTint?: boolean
	edgeStyle?: EdgeStyle
	focus?: string | null
	value?: string | null
	preset?: GraphPreset
	mode?: 'light' | 'dark'
	label?: string
	onselect?: (id: string | null) => void
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`

/** How `id` sits on an edge: not on it, both ends of it, or one end with a far side. */
function endpointsFor(
	edge: GraphEdge,
	id: string
): { self: boolean; other: string; direction: 'in' | 'out' } | null {
	const isSource = edge.source === id
	const isTarget = edge.target === id
	if (!isSource && !isTarget) return null

	return {
		self: isSource && isTarget,
		other: isSource ? edge.target : edge.source,
		direction: isSource ? 'out' : 'in'
	}
}

/**
 * One edge's contribution to the selected node's relationship list.
 *
 * An UNPLACED edge is reported too, with the raw name as the label — the far end is not a
 * node, so there is nothing to look up. Hiding it would be worse: "this references something
 * we have not indexed" is exactly what a reader of a partial graph needs to see.
 */
function describeEdge(
	edge: GraphEdge,
	id: string,
	describe: (other: string, direction: 'in' | 'out', edge: GraphEdge) => Relationship
): Relationship[] {
	const ends = endpointsFor(edge, id)
	if (!ends) return []
	if (ends.self) return [describe(id, 'out', edge)]

	const { other, direction } = ends

	// An unplaced far end is not a node, so there is nothing to look up: the raw name IS
	// the label. Reported rather than hidden — "references something not indexed" is what a
	// reader of a partial graph most needs to see.
	return edge.unplaced
		? [{ direction, id: other, label: other, edge }]
		: [describe(other, direction, edge)]
}

/** Bottom-right extent of a set of boxes, or {0,0} when there are none. */
function extentOf(boxes: { x: number; y: number; w: number; h: number }[]): Size {
	let w = 0
	let h = 0

	for (const box of boxes) {
		w = Math.max(w, box.x + box.w)
		h = Math.max(h, box.y + box.h)
	}

	return { w, h }
}

/**
 * The store. Turns raw `nodes`/`edges`/`fields` into the reactive shape the visuals
 * render, and owns every transition.
 *
 * Components read from this and call its methods — they never compute. That is what
 * lets the geometry, badge derivation and selection logic be covered exhaustively
 * with no DOM, and lets the component specs assert only attributes.
 *
 * `update()` is re-callable and FULLY re-applies config rather than merging deltas,
 * matching `SparkState.update` — so a prop reverting to undefined actually reverts.
 * Deliberately NOT `PlotState.update`, which guards each field with
 * `if (config.X !== undefined)` and therefore merges.
 */
/**
 * Sorted unique strings, dropping empties.
 *
 * Sort-then-dedupe rather than a `Set`: these vocabularies are tiny and the result has to be
 * sorted anyway, so the Set would be an extra structure for nothing — and a plain Set inside a
 * reactive class is exactly what `svelte/prefer-svelte-reactivity` is right to flag.
 */
/**
 * A level cap, or nothing.
 *
 * Left UNDEFINED when the caller said nothing: a state-level default of 2 is indistinguishable
 * from an explicit 2, and `radial` needs "no cap" to mean the whole tree — inventing a number
 * here silently pruned a codebase dendrogram to two rings.
 */
function floorLevels(levels: number | undefined): number | undefined {
	return levels === undefined ? undefined : Math.max(1, Math.floor(levels))
}

function unique(values: (string | undefined)[]): string[] {
	return values
		.filter((v): v is string => Boolean(v))
		.sort()
		.filter((v, i, all) => i === 0 || v !== all[i - 1])
}

export class GraphState {
	#nodes = $state<unknown[]>([])
	#edges = $state<unknown[]>([])
	#fields = $state<GraphFields>({})
	#layout = $state<string | LayoutFn>('flow')
	#groupTint = $state(false)
	#radialMode = $state<'tree' | 'dendrogram'>('tree')
	#root = $state<string | null>(null)
	#density = $state<Density>('keys')
	#arrange = $state<Arrange>('untangle')
	#groupBy = $state<NodeAxis>('group')
	#nestBy = $state<NodeAxis | null>(null)
	#sizeBy = $state<string>('degree')
	#sizeScale = $state<'linear' | 'log'>('linear')
	#depth = $state<number>(1)
	#focusPath = $state<string[]>([])
	#levels = $state<number | undefined>(undefined)
	#edgeStyle = $state<EdgeStyle>('curved')
	#focus = $state<string | null>(null)
	#value = $state<string | null>(null)
	#expanded = new SvelteSet<string>()
	#preset = $state<GraphPreset>(defaultGraphPreset)
	#mode = $state<'light' | 'dark'>('light')
	#label = $state<string | undefined>(undefined)
	#onselect = $state<((id: string | null) => void) | undefined>(undefined)

	#model = $derived(normalizeGraph(this.#nodes, this.#edges, this.#fields))

	#layoutFn = $derived(
		typeof this.#layout === 'function' ? this.#layout : (layouts[this.#layout] ?? layouts.cluster)
	)

	#result = $derived(
		this.#layoutFn(this.#model, {
			density: this.#density,
			arrange: this.#arrange,
			groupBy: this.#groupBy,
			nestBy: this.#nestBy ?? undefined,
			sizeBy: this.#sizeBy,
			sizeScale: this.#sizeScale,
			depth: this.#depth,
			focusPath: this.#focusPath,
			levels: this.#levels,
			radialMode: this.#radialMode,
			root: this.#root,
			edgeStyle: this.#edgeStyle,
			focus: this.#focus ?? this.#value,
			expanded: this.#expanded
		})
	)

	// Duplicates are left in on purpose: `resolveGroupStyles` de-duplicates and sorts, because
	// that is where ramp assignment lives. A Set here would be a second, redundant de-dup.
	#groups = $derived(
		this.#model.nodes.map((n) => n.group).filter((g): g is string => Boolean(g))
	)

	#groupStyles = $derived(resolveGroupStyles(this.#groups, this.#mode, this.#preset))

	#related = $derived(
		this.#value
			? new SvelteSet(this.#model.neighbors.get(this.#value) ?? [])
			: new SvelteSet<string>()
	)

	#entities = $derived(
		this.#model.nodes.map((node) => ({
			id: node.id,
			label: node.label,
			group: node.group,
			kind: node.kind,
			rowCount: node.rows.length,
			refCount: this.#model.edges.filter((e) => e.source === node.id || e.target === node.id)
				.length,
			note: node.note
		}))
	)

	#entity = $derived(this.#value ? (this.#model.byId.get(this.#value) ?? null) : null)

	/**
	 * Derived from `#model.edges` — the canonical, unfiltered model — NOT from `#result.edges`.
	 *
	 * A layout filters: `cluster` drops edges whose endpoints were not laid out, and
	 * `neighborhood` lays out only the focus node's 1-hop neighbourhood. Since `focus` and
	 * `value` are independent config fields, reading the layout's edges lets the state
	 * contradict itself: with `focus: 'audit.log'` (no neighbours) and `value: 'public.orders'`,
	 * `relationships` would be `[]` while `entities`' `refCount` for the same node is 1.
	 *
	 * Routed geometry is attached opportunistically — it exists only for edges the active layout
	 * actually placed, so `routed` is optional on `Relationship`. A relationship is a fact about
	 * the model; its geometry is a fact about the current view.
	 */
	#relationships = $derived.by((): Relationship[] => {
		const id = this.#value
		if (!id) return []

		// A plain Map on purpose: a call-local lookup built once from an already-derived array
		// and discarded when this derivation re-runs. Nothing outside can observe it, so
		// SvelteMap would add proxying for no reactivity.
		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		const routed = new Map(this.#result.edges.map((e) => [e.id, e]))

		const describe = (other: string, direction: 'in' | 'out', edge: GraphEdge): Relationship => {
			// normalizeGraph drops any edge whose endpoints do not resolve, so both ends of
			// every edge in #model.edges are in byId. No `?? other` fallback here: an
			// unreachable branch cannot be tested, and the package's 100% statement bar
			// exists to keep that honest.
			const node = this.#model.byId.get(other) as GraphNode

			return {
				direction,
				id: other,
				label: node.label,
				group: node.group,
				edge,
				routed: routed.get(edge.id)
			}
		}

		return this.#model.edges.flatMap((edge) => describeEdge(edge, id, describe))
	})

	constructor(config: GraphStateConfig = {}) {
		this.update(config)
	}

	/**
	 * Fully re-applies config. Safe to call on every prop change.
	 *
	 * Split across two helpers only to stay under the complexity bar — every field is still
	 * assigned unconditionally on every call, which is the contract the specs enforce
	 * field by field.
	 */
	update(config: GraphStateConfig = {}): void {
		this.#applyData(config)
		this.#applyView(config)
		// `value` is input AND output, so it is only adopted when the caller supplies
		// one — otherwise a re-render would wipe a selection the user just made.
		if (config.value !== undefined) this.#value = config.value
	}

	#applyData(config: GraphStateConfig): void {
		this.#nodes = config.nodes ?? []
		this.#edges = config.edges ?? []
		this.#fields = config.fields ?? {}
		this.#layout = config.layout ?? 'flow'
		this.#focus = config.focus ?? null
	}

	/** How the boxes are organised — one axis, or one subdivided by a second. */
	#applyGrouping(config: GraphStateConfig): void {
		const outer = config.groupBy ?? 'group'
		this.#groupBy = outer
		// Rejected rather than rendered: a box subdivided by its OWN axis yields exactly one
		// child containing everything, which reads as a rendering fault, not a no-op.
		this.#nestBy = config.nestBy === outer ? null : (config.nestBy ?? null)
		this.#groupTint = config.groupTint ?? false
	}

	/** What a node's size encodes, and how far a neighbourhood reaches. */
	#applyMeasure(config: GraphStateConfig): void {
		this.#sizeBy = config.sizeBy ?? 'degree'
		this.#sizeScale = config.sizeScale ?? 'linear'
		// Floored at 1: a depth of 0 or -1 is a request for nothing, and returning an empty
		// canvas for it looks identical to a broken focus.
		this.#depth = Math.max(1, Math.floor(config.depth ?? 1))
		this.#focusPath = config.focusPath ?? []
		this.#levels = floorLevels(config.levels)
		this.#root = config.root ?? null
		this.#radialMode = config.radialMode ?? 'tree'
	}

	#applyView(config: GraphStateConfig): void {
		this.#density = config.density ?? 'keys'
		this.#arrange = config.arrange ?? 'untangle'
		this.#applyGrouping(config)
		this.#applyMeasure(config)
		this.#edgeStyle = config.edgeStyle ?? 'curved'
		this.#preset = config.preset ?? defaultGraphPreset
		this.#mode = config.mode ?? 'light'
		this.#label = config.label
		this.#onselect = config.onselect
	}

	// ─── transitions ───────────────────────────────────────────────────────────
	select(id: string): void {
		this.#value = id
		this.#onselect?.(id)
	}

	/**
	 * Drop the selection, and SAY SO.
	 *
	 * Found by dbd consuming the package: it owns `selected` in its route and branches on it
	 * to show the entity panel, so a silent clear left that panel open over nothing. A
	 * controlled consumer cannot observe an internal `#value` — the callback is the only
	 * channel, which is why it carries `null` rather than being skipped.
	 *
	 * Guarded on an actual change, or a background click on an already-empty canvas
	 * round-trips through the consumer's setter on every stray click.
	 */
	clear(): void {
		if (this.#value === null) return
		this.#value = null
		this.#onselect?.(null)
	}

	/**
	 * Show one node's rows in full, whatever the density says.
	 *
	 * Per NODE rather than a global density change: a reader who clicks "+3 more" on one
	 * card is asking about that card, and expanding all of them answers a question they did
	 * not ask — on a large diagram it also relayouts everything under them.
	 */
	toggleExpanded(id: string): void {
		if (this.#expanded.has(id)) this.#expanded.delete(id)
		else this.#expanded.add(id)
	}

	isExpanded(id: string): boolean {
		return this.#expanded.has(id)
	}

	/**
	 * The more-row's text, or null when the card is hiding nothing and needs no control.
	 *
	 * The "no keys" case is the whole reason this is a method rather than a template
	 * expression. A view, a procedure and an enum have no pk and no fk — correctly, they are
	 * not tables — so at 'keys' their cards collapse to a title and "+3 more", which is
	 * indistinguishable from a card the reader collapsed and reads as a rendering failure.
	 * The count alone cannot say WHY the rows are hidden; naming the empty filter can.
	 *
	 * Scoped to 'keys' because 'names' hides every row BY DESIGN — an empty card there is the
	 * answer to what was asked, not a filter that matched nothing.
	 */
	moreLabel(id: string): string | null {
		if (this.#expanded.has(id)) return 'show less'

		const card = this.cards[id]
		if (!card || card.more <= 0) return null
		if (this.#density !== 'keys' || card.vis.length > 0) return `+ ${card.more} more`

		return `no keys · ${card.more} ${card.more === 1 ? 'row' : 'rows'}`
	}

	/**
	 * Change the detail level from inside the component.
	 *
	 * Needed because `Graph`'s `density` PROP only ever reaches the state it owns. With a
	 * caller-supplied state — which is how all three views share one — a control that set the
	 * prop would render, click, and change nothing.
	 */
	setDensity(density: Density): void {
		this.#density = density
	}

	// ─── per-item lookups the templates need ───────────────────────────────────
	nodeState(id: string): 'selected' | 'related' | 'dim' | null {
		if (!this.#value) return null
		if (id === this.#value) return 'selected'
		return this.#related.has(id) ? 'related' : 'dim'
	}

	edgeState(edge: RoutedEdge): 'highlight' | 'dim' | null {
		if (!this.#value) return null
		return edge.fromKey === this.#value || edge.toKey === this.#value ? 'highlight' : 'dim'
	}

	edgePath(edge: RoutedEdge): string {
		return edgePath(edge, this.#edgeStyle)
	}

	groupStyle(group: string | undefined): Record<string, string> {
		return (group && this.#groupStyles.get(group)) || {}
	}

	/**
	 * The same style as a `style=` attribute string.
	 *
	 * A template cannot spread an object into `style`, so something has to serialise it.
	 * Doing that inline put the same map/join in two places in `Graph.svelte` — a derivation
	 * living in a component, which is the one thing this layer exists to prevent.
	 */
	groupStyleAttr(group: string | undefined): string {
		return Object.entries(this.groupStyle(group))
			.map(([property, value]) => `${property}:${value}`)
			.join(';')
	}

	// ─── reads ─────────────────────────────────────────────────────────────────
	get model(): GraphModel {
		return this.#model
	}
	/**
	 * Clusters drawn as rectangles — everything the box renderer handles.
	 *
	 * A wedge has no box, so it is drawn as an SVG arc instead. Split here rather than in the
	 * template so the component keeps computing nothing.
	 */
	get boxes(): Cluster[] {
		return this.clusters.filter((c) => c.wedge === undefined)
	}

	/** Whether any cluster is a wedge, which is what puts the arc layer on the canvas. */
	get hasWedges(): boolean {
		return this.clusters.some((c) => c.wedge !== undefined)
	}

	get clusters(): Cluster[] {
		return this.#result.clusters
	}
	get cards(): Cards {
		return this.#result.cards
	}
	get routedEdges(): RoutedEdge[] {
		return this.#result.edges
	}
	get size(): Size {
		return this.#result.size
	}
	/**
	 * The true content extent, as distinct from `size`.
	 *
	 * `LayoutResult.size` adds a +60 margin on the right and bottom only, so fitting to it hugs
	 * the left/top edge and floats away from the right/bottom. Centring needs the real bounds.
	 *
	 * This lives in state, not in `Graph.svelte`, because it is a pure max over `clusters` — no
	 * viewport involved. Only the `scale`/`tx`/`ty` that consume it need `clientWidth`, and those
	 * stay in the component. Keeping this here is what lets it be tested without a renderer.
	 */
	get contentSize(): Size {
		const clusters = this.#result.clusters.map((c) => ({
			x: c.x,
			y: c.y,
			w: c.w ?? 0,
			h: c.h ?? 0
		}))
		let { w, h } = extentOf(clusters)

		// An ungrouped layout (neighborhood) reports no clusters, so fall back to the cards.
		if (!w || !h) {
			const cards = extentOf(Object.values(this.#result.cards))
			w = Math.max(w, cards.w)
			h = Math.max(h, cards.h)
		}

		return { w: w || this.#result.size.w, h: h || this.#result.size.h }
	}
	get related(): SvelteSet<string> {
		return this.#related
	}
	get entities(): EntityRow[] {
		return this.#entities
	}
	get entity(): GraphNode | null {
		return this.#entity
	}
	get relationships(): Relationship[] {
		return this.#relationships
	}
	/**
	 * Edges the field map could not place at one or both ends.
	 *
	 * Exposed rather than hidden because at scale this is the MAJORITY: Sensei's code graph
	 * reports 59.6% of 4.08M edges with a null target. A view that silently omitted them
	 * would claim a completeness the data does not have. They are absent from `routedEdges`
	 * because there is no card to draw them between — that is geometry, not a judgement.
	 */
	get unplacedEdges(): GraphEdge[] {
		return this.#model.edges.filter((e) => e.unplaced !== undefined)
	}
	get density(): Density {
		return this.#density
	}
	get arrange(): Arrange {
		return this.#arrange
	}

	/**
	 * A cluster's unique render key.
	 *
	 * NOT the name: nesting puts a `table` box under `public` AND under `billing`, and keying
	 * an `{#each}` by name alone is a duplicate key — Svelte throws `each_key_duplicate`, the
	 * render aborts, and no inner box appears at all, which reads as nesting silently not
	 * working rather than as an error.
	 */
	/**
	 * The SVG path for a wedge-shaped box, centred on the canvas.
	 *
	 * Here rather than in the component for the same reason `edgePath` is: it is arithmetic,
	 * and the view's job is to render what state derives, not to compute geometry.
	 */
	wedgePath(cluster: Cluster): string {
		if (!cluster.wedge) return ''

		return arcPath(this.size.w / 2, this.size.h / 2, cluster.wedge)
	}

	/**
	 * The data attributes every containment box carries, wedge or rectangle.
	 *
	 * Built here so the two render branches — interactive and scenery — cannot drift: they
	 * differ only in the element and its role, which is exactly the difference that matters.
	 */
	boxAttrs(cluster: Cluster): Record<string, string | null | undefined> {
		return {
			'data-cluster-depth': String(cluster.depth ?? 0),
			'data-node-group': cluster.name,
			'data-graph-node-id': cluster.nodeId,
			'data-node-kind': cluster.kind,
			'data-node-state': cluster.nodeId ? this.nodeState(cluster.nodeId) : undefined
		}
	}

	clusterKey(cluster: Cluster): string {
		return `${cluster.depth ?? 0}:${cluster.parent ?? ''}:${cluster.name}`
	}

	get groupBy(): NodeAxis {
		return this.#groupBy
	}

	/**
	 * The node kinds actually present, sorted.
	 *
	 * What a LEGEND needs: naming the whole vocabulary over a diagram that uses three of it is
	 * a key to a different picture, and the reader hunts for a `trigger` that is not there.
	 */
	get kindsPresent(): string[] {
		return unique(this.#model.nodes.map((n) => n.kind))
	}

	/**
	 * The edge relations present, sorted — the producer's verb where it gave one, else the
	 * coarse kind.
	 *
	 * A plain foreign key carries no verb, and listing nothing for it would leave the one
	 * stroke actually on the canvas unexplained.
	 */
	get relationsPresent(): string[] {
		return unique(this.#model.edges.map((e) => e.relation ?? e.kind))
	}

	/** The group names present, sorted. Same reasoning as `kindsPresent`. */
	get groupsPresent(): string[] {
		return unique(this.#model.nodes.map((n) => n.group))
	}

	/** Whether cards carry the group ramp themselves. See `GraphStateConfig.groupTint`. */
	/** `dot` or `card` — what the active layout draws a node as. */
	get nodeShape(): 'dot' | 'card' {
		return nodeShapeOf(this.layoutName)
	}

	get groupTint(): boolean {
		return this.#groupTint
	}

	get nestBy(): NodeAxis | null {
		return this.#nestBy
	}

	get sizeBy(): string {
		return this.#sizeBy
	}

	get sizeScale(): 'linear' | 'log' {
		return this.#sizeScale
	}

	get depth(): number {
		return this.#depth
	}

	get focusPath(): string[] {
		return this.#focusPath
	}

	/** The configured cap, or the package default of 2 when none was set. */
	get levels(): number {
		return this.#levels ?? 2
	}

	/**
	 * Column headings for a multi-column layout, empty for the grid ones.
	 *
	 * Exposed so the view can render headings without knowing which layout is active or what
	 * it means — the layout decides both the position and the wording, and the component
	 * prints them.
	 */
	get columns(): Column[] {
		return this.#result.columns ?? []
	}

	/**
	 * Change the grouping axes from inside the component.
	 *
	 * Same reason `setDensity` exists: a `groupBy` PROP only ever reaches the state `Graph`
	 * owns, so with a caller-supplied state — which is how all three views share one — a
	 * control that set the prop would render, click, and change nothing.
	 *
	 * Passing the same axis for both is rejected rather than silently rendered: a box
	 * subdivided by itself produces exactly one child containing everything, which looks like
	 * a rendering fault rather than a no-op.
	 */
	setGrouping(outer: NodeAxis, inner: NodeAxis | null = null): void {
		this.#groupBy = outer
		this.#nestBy = inner === outer ? null : inner
	}
	get edgeStyle(): EdgeStyle {
		return this.#edgeStyle
	}
	get mode(): 'light' | 'dark' {
		return this.#mode
	}
	/** The layout's registry key, or 'custom' when a LayoutFn was passed directly. */
	get layoutName(): string {
		return typeof this.#layout === 'string' ? this.#layout : 'custom'
	}
	get value(): string | null {
		return this.#value
	}
	get label(): string {
		return (
			this.#label ??
			`Diagram of ${plural(this.#model.nodes.length, 'node')} and ${plural(
				this.#model.edges.length,
				'relationship'
			)}`
		)
	}
}

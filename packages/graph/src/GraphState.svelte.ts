import { SvelteSet } from 'svelte/reactivity'
import { normalizeGraph } from './model/normalize.js'
import { layouts } from './layout/index.js'
import { buildEdges, edgePath } from './layout/edges.js'
import { nodeShapeOf } from './layout/options.js'
import { arcPath } from './layout/arc.js'
import { resolveGroupStyles } from './preset.js'
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
import type { Relationship } from './model/relationships.js'
import { entityRows } from './model/entities.js'
import type { EntityRow } from './model/entities.js'
import { contentExtent } from './layout/extent.js'
import { GraphConfig } from './state/GraphConfig.svelte.js'
import { GraphSelection } from './state/GraphSelection.svelte.js'
import { GraphDrill } from './state/GraphDrill.svelte.js'
import { GraphGroups } from './state/GraphGroups.svelte.js'
import type { GroupAction } from './state/GraphGroups.svelte.js'
import { condense } from './model/condense.js'
import type { Breadcrumb } from './state/GraphDrill.svelte.js'

export type { Relationship, EntityRow, Breadcrumb, GroupAction }

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
	/** `structure` only — how hard edges are pulled onto the tree, 0..1. */
	bundleTension?: number
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
	/**
	 * The reader drilled INTO a box: `path` is the new `focusPath`, `node` the declared node at
	 * it (null for a container nothing declared). Return a promise to show a pending state
	 * until the level's data arrives; a rejection restores the previous level. Distinct from
	 * `onselect` — drilling changes scope, it does not select.
	 */
	ondrill?: (path: string[], node: GraphNode | null) => void | Promise<void>
	/** The reader drilled OUT; `path` is the new, shorter `focusPath`. Same promise contract. */
	ondrillup?: (path: string[]) => void | Promise<void>
	/**
	 * Every internal change of `focusPath` — drill in, out, or a rollback after a failed load.
	 * For a component that owns a bindable `focusPath` prop, so its next `update()` agrees.
	 */
	onfocuspath?: (path: string[]) => void
	/**
	 * The reader expanded a group (#166). With its members already in `nodes` they appear at
	 * once; a host that sends only the group can load them in answer.
	 */
	onexpand?: (id: string, node: GraphNode) => void
	/** The reader collapsed a group back into one node. */
	oncollapse?: (id: string, node: GraphNode) => void
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`

/**
 * Sorted unique strings, dropping empties.
 *
 * Sort-then-dedupe rather than a `Set`: these vocabularies are tiny and the result has to be
 * sorted anyway, so the Set would be an extra structure for nothing — and a plain Set inside a
 * reactive class is exactly what `svelte/prefer-svelte-reactivity` is right to flag.
 */
function unique(values: (string | undefined)[]): string[] {
	return values
		.filter((v): v is string => Boolean(v))
		.sort()
		.filter((v, i, all) => i === 0 || v !== all[i - 1])
}

/**
 * The store. Turns raw `nodes`/`edges`/`fields` into the reactive shape the visuals
 * render, and owns every transition.
 *
 * Components read from this and call its methods — they never compute. That is what
 * lets the geometry, badge derivation and selection logic be covered exhaustively
 * with no DOM, and lets the component specs assert only attributes.
 *
 * A composition: `config` (every input, `state/GraphConfig`) feeds the layout pipeline
 * derived here; the selection and the view queries read both. `update()` FULLY re-applies
 * config rather than merging deltas — so a prop reverting to undefined actually reverts;
 * `apply()` merges.
 */
export class GraphState {
	/** Every input — see `CONFIG_FIELDS` for what each omitted key falls back to. */
	readonly config = new GraphConfig()
	/** Which subtree is the canvas, and the host events for moving it (#165). */
	readonly drill: GraphDrill = new GraphDrill({
		config: this.config,
		model: () => this.#model,
		layoutName: () => this.layoutName
	})

	/** What the reader picked and opened. */
	readonly selection: GraphSelection = new GraphSelection({
		model: () => this.#model,
		routedEdges: () => this.#result.edges,
		onselect: () => this.config.onselect
	})

	/** The model as normalised — every group AND every member. */
	#canonical = $derived(normalizeGraph(this.config.nodes, this.config.edges, this.config.fields))

	/** Which groups are collapsed (#166). */
	readonly groups: GraphGroups = new GraphGroups({
		model: () => this.#canonical,
		config: this.config
	})

	/** What is drawn: the canonical model with each collapsed group standing in for its members. */
	#model = $derived(condense(this.#canonical, this.groups.collapsed))

	#layoutFn = $derived(
		typeof this.config.layout === 'function' ? this.config.layout : (layouts[this.config.layout] ?? layouts.cluster)
	)

	#result = $derived(
		this.#layoutFn(this.#model, {
			density: this.config.density,
			arrange: this.config.arrange,
			groupBy: this.config.groupBy,
			nestBy: this.config.nestBy ?? undefined,
			sizeBy: this.config.sizeBy,
			sizeScale: this.config.sizeScale,
			depth: this.config.depth,
			focusPath: this.config.focusPath,
			levels: this.config.levels,
			radialMode: this.config.radialMode,
			root: this.config.root,
			bundleTension: this.config.bundleTension,
			edgeStyle: this.config.edgeStyle,
			focus: this.config.focus ?? this.selection.value,
			expanded: this.selection.expanded
		})
	)

	/**
	 * Overlay edges routed over the finished layout. The layout never saw them — that is the
	 * point — so they are routed here, against whatever cards it placed. A layout with no cards
	 * (the treemap, the sunburst) simply has nothing to route them between.
	 */
	#overlayRouted = $derived(buildEdges(this.#model.overlays, this.#result.cards))

	#routed = $derived(
		this.#overlayRouted.length > 0
			? [...this.#result.edges, ...this.#overlayRouted]
			: this.#result.edges
	)

	/** Heaviest weight across every edge that carries one — the 1 that `edgeWeight` scales to. */
	#maxEdgeWeight = $derived(
		Math.max(0, ...[...this.#model.edges, ...this.#model.overlays].map((e) => e.weight ?? 0))
	)

	// Duplicates are left in on purpose: `resolveGroupStyles` de-duplicates and sorts, because
	// that is where ramp assignment lives. A Set here would be a second, redundant de-dup.
	#groups = $derived(this.#model.nodes.map((n) => n.group).filter((g): g is string => Boolean(g)))

	#groupStyles = $derived(resolveGroupStyles(this.#groups, this.config.mode, this.config.preset))

	#entities = $derived(entityRows(this.#model))

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
		this.config.update(config)
		this.#adoptValue(config)
	}

	/**
	 * `value` is input AND output, so it is only adopted when the caller supplies one —
	 * otherwise a re-render would wipe a selection the user just made.
	 */
	#adoptValue(config: GraphStateConfig): void {
		if (config.value !== undefined) this.selection.adopt(config.value)
	}

	/**
	 * Merge a partial config, leaving every key it does not name alone.
	 *
	 * `update()` fully RE-APPLIES — an omitted key reverts to its default, which is what makes
	 * it safe to call from a render. That is the wrong verb for a component writing the few
	 * options its own controls drive into a state someone else owns: it would reset the
	 * owner's data on every keystroke. This merges over the last full config instead.
	 */
	apply(config: Partial<GraphStateConfig>): void {
		this.#adoptValue(this.config.apply(config))
	}

	// ─── transitions ───────────────────────────────────────────────────────────
	select(id: string): void {
		this.selection.select(id)
	}

	/** Drop the selection and report `null` — see `GraphSelection.clear`. */
	clear(): void {
		this.selection.clear()
	}

	/** Show one node's rows in full, whatever the density says — see `GraphSelection`. */
	toggleExpanded(id: string): void {
		this.selection.toggleExpanded(id)
	}

	isExpanded(id: string): boolean {
		return this.selection.isExpanded(id)
	}

	// ─── groups (#166) — see GraphGroups ────────────────────────────────────────
	isGroup(id: string): boolean {
		return this.groups.isGroup(id)
	}
	isCollapsed(id: string): boolean {
		return this.groups.isCollapsed(id)
	}
	memberCount(id: string): number {
		return this.groups.memberCount(id)
	}
	groupOf(id: string): string | null {
		return this.groups.groupOf(id)
	}
	/**
	 * Expand or collapse a group. Collapsing one whose member is selected moves the selection to
	 * the group: the thing being looked at is now inside it, and a selection naming a hidden node
	 * would leave the entity panel empty for no visible reason.
	 */
	toggleGroup(id: string): boolean {
		const collapsing = this.groups.isGroup(id) && !this.groups.isCollapsed(id)
		const selected = this.value
		const holdsSelection = collapsing && selected !== null && this.groups.groupOf(selected) === id
		if (!this.groups.toggle(id)) return false
		if (holdsSelection) this.select(id)
		return true
	}
	/** The selection's group action — what a drill bar offers. */
	get groupAction(): GroupAction | null {
		return this.groups.actionFor(this.value)
	}

	// ─── drilling (#165) — see GraphDrill ───────────────────────────────────────
	get drillPath(): string[] {
		return this.drill.path
	}
	get breadcrumbs(): Breadcrumb[] {
		return this.drill.breadcrumbs
	}
	/** A drill's handler returned a promise that has not settled. */
	get pending(): boolean {
		return this.drill.pending
	}
	get drillError(): unknown {
		return this.drill.error
	}
	canDrill(box: Cluster): boolean {
		return this.drill.canDrill(box)
	}
	drillInto(box: Cluster): boolean {
		return this.drill.drillInto(box)
	}
	drillOut(levels = 1): boolean {
		return this.drill.drillOut(levels)
	}
	drillTo(path: string[]): boolean {
		return this.drill.drillTo(path)
	}
	/**
	 * The selected box, when it can be opened — what a drill bar's "Open" acts on. The keyboard
	 * route into a leaf: Enter selects it, and this is the next step.
	 */
	get drillTarget(): Cluster | null {
		const value = this.value
		if (!value) return null
		return this.clusters.find((c) => c.nodeId === value && this.canDrill(c)) ?? null
	}
	/** Whether a drill bar has anything to show: a trail, a load, a failure, or a box to open. */
	get showsDrillBar(): boolean {
		return (
			this.drillPath.length > 0 ||
			this.pending ||
			this.drillError !== null ||
			this.drillTarget !== null ||
			this.groupAction !== null
		)
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
		if (this.selection.isExpanded(id)) return 'show less'

		const card = this.cards[id]
		if (!card || card.more <= 0) return null
		if (this.config.density !== 'keys' || card.vis.length > 0) return `+ ${card.more} more`

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
		this.config.setDensity(density)
	}

	// ─── per-item lookups the templates need ───────────────────────────────────
	nodeState(id: string): 'selected' | 'related' | 'dim' | null {
		return this.selection.nodeState(id)
	}

	edgeState(edge: RoutedEdge): 'highlight' | 'dim' | null {
		return this.selection.edgeState(edge)
	}

	edgePath(edge: RoutedEdge): string {
		// A layout that knows more than the endpoints builds its own — a bundled edge follows
		// the whole chain of ancestors between them, which `edgePath` never sees.
		return edge.path ?? edgePath(edge, this.config.edgeStyle)
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
	/** Structural edges as the layout routed them, then any overlay edges on top. */
	get routedEdges(): RoutedEdge[] {
		return this.#routed
	}
	/** Every overlay edge in the model, placed or not. */
	get overlayEdges(): GraphEdge[] {
		return this.#model.overlays
	}
	/**
	 * An edge's weight as 0..1 of the heaviest weighted edge, for stroke width — or undefined
	 * for an edge with no weight, which draws at the theme's normal width.
	 */
	edgeWeight(edge: RoutedEdge): number | undefined {
		if (edge.weight === undefined || this.#maxEdgeWeight <= 0) return undefined
		return edge.weight / this.#maxEdgeWeight
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
		return contentExtent(this.#result.clusters, this.#result.cards, this.#result.size)
	}
	get related(): SvelteSet<string> {
		return this.selection.related
	}
	get entities(): EntityRow[] {
		return this.#entities
	}
	get entity(): GraphNode | null {
		return this.selection.entity
	}
	get relationships(): Relationship[] {
		return this.selection.relationships
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
		return this.config.density
	}
	get arrange(): Arrange {
		return this.config.arrange
	}

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

	/**
	 * A cluster's unique render key.
	 *
	 * NOT the name: nesting puts a `table` box under `public` AND under `billing`, and keying
	 * an `{#each}` by name alone is a duplicate key — Svelte throws `each_key_duplicate`, the
	 * render aborts, and no inner box appears at all, which reads as nesting silently not
	 * working rather than as an error.
	 */
	clusterKey(cluster: Cluster): string {
		// A containment box's PATH is its address, unique by construction; the parent's label is
		// not — `lib/marks` under `geoms` and under `src` share depth, parent label and name.
		// A pathless box (an orphan node at the root, or a group box) keeps the label key.
		if (cluster.path && cluster.path.length > 0) return `path:${cluster.path.join('/')}`
		return `${cluster.depth ?? 0}:${cluster.parent ?? ''}:${cluster.name}`
	}

	get groupBy(): NodeAxis {
		return this.config.groupBy
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

	/** `dot` or `card` — what the active layout draws a node as. */
	get nodeShape(): 'dot' | 'card' {
		return nodeShapeOf(this.layoutName)
	}

	/** Whether cards carry the group ramp themselves. See `GraphStateConfig.groupTint`. */
	get groupTint(): boolean {
		return this.config.groupTint
	}

	get nestBy(): NodeAxis | null {
		return this.config.nestBy
	}

	get sizeBy(): string {
		return this.config.sizeBy
	}

	get sizeScale(): 'linear' | 'log' {
		return this.config.sizeScale
	}

	get depth(): number {
		return this.config.depth
	}

	get focusPath(): string[] {
		return this.config.focusPath
	}

	/** The configured cap, or the package default of 2 when none was set. */
	get levels(): number {
		return this.config.levels ?? 2
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
		this.config.setGrouping(outer, inner)
	}
	get edgeStyle(): EdgeStyle {
		return this.config.edgeStyle
	}
	get mode(): 'light' | 'dark' {
		return this.config.mode
	}
	/** The layout's registry key, or 'custom' when a LayoutFn was passed directly. */
	get layoutName(): string {
		return typeof this.config.layout === 'string' ? this.config.layout : 'custom'
	}
	get value(): string | null {
		return this.selection.value
	}
	get label(): string {
		return (
			this.config.label ??
			`Diagram of ${plural(this.#model.nodes.length, 'node')} and ${plural(
				this.#model.edges.length,
				'relationship'
			)}`
		)
	}
}

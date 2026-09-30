import { defaultGraphPreset } from '../preset.js'
import type { GraphPreset } from '../preset.js'
import type { Arrange, Density, EdgeStyle, LayoutFn, NodeAxis } from '../layout/types.js'
import type { GraphFields } from '../types.js'
import type { GraphStateConfig } from '../GraphState.svelte.js'

export type GraphConfigValues = {
	nodes: unknown[]
	edges: unknown[]
	fields: GraphFields
	layout: string | LayoutFn
	focus: string | null
	density: Density
	arrange: Arrange
	groupBy: NodeAxis
	nestBy: NodeAxis | null
	groupTint: boolean
	sizeBy: string
	sizeScale: 'linear' | 'log'
	depth: number
	focusPath: string[]
	levels: number | undefined
	root: string | null
	bundleTension: number | undefined
	radialMode: 'tree' | 'dendrogram'
	edgeStyle: EdgeStyle
	preset: GraphPreset
	mode: 'light' | 'dark'
	label: string | undefined
	onselect: ((id: string | null) => void) | undefined
}

type Key = keyof GraphConfigValues

type Field = {
	key: Key
	/** Shapes the supplied-or-fallback value; sees the whole config (nestBy reads groupBy). */
	normalise?: (value: unknown, config: GraphStateConfig) => unknown
} & (
	| { fallback: () => unknown; raw?: never }
	/** Taken as given — a `null` stays `null`, an omitted key is `undefined` — no fallback. */
	| { raw: true; fallback?: never }
)

/**
 * A level cap, or nothing.
 *
 * Left UNDEFINED when the caller said nothing: a state-level default of 2 is indistinguishable
 * from an explicit 2, and `radial` needs "no cap" to mean the whole tree — inventing a number
 * here silently pruned a codebase dendrogram to two rings.
 */
const floorLevels = (levels: unknown) =>
	levels === undefined ? undefined : Math.max(1, Math.floor(levels as number))

/**
 * Rejected rather than rendered: a box subdivided by its OWN axis yields exactly one child
 * containing everything, which reads as a rendering fault, not a no-op.
 */
const distinctNest = (inner: NodeAxis | null, outer: NodeAxis) => (inner === outer ? null : inner)

/**
 * Every input, its default, and how it is shaped. `update()` assigns every field on every call —
 * an omitted key reverts to its fallback, which is the contract the GraphState specs pin
 * field by field.
 */
export const CONFIG_FIELDS: readonly Field[] = Object.freeze([
	{ key: 'nodes', fallback: () => [] },
	{ key: 'edges', fallback: () => [] },
	{ key: 'fields', fallback: () => ({}) },
	{ key: 'layout', fallback: () => 'flow' },
	{ key: 'focus', fallback: () => null },
	{ key: 'density', fallback: () => 'keys' },
	{ key: 'arrange', fallback: () => 'untangle' },
	{ key: 'groupBy', fallback: () => 'group' },
	{
		key: 'nestBy',
		fallback: () => null,
		normalise: (v, config) => distinctNest(v as NodeAxis | null, config.groupBy ?? 'group')
	},
	{ key: 'groupTint', fallback: () => false },
	{ key: 'sizeBy', fallback: () => 'degree' },
	{ key: 'sizeScale', fallback: () => 'linear' },
	// Floored at 1: a depth of 0 or -1 is a request for nothing, and returning an empty canvas
	// for it looks identical to a broken focus.
	{ key: 'depth', fallback: () => 1, normalise: (v) => Math.max(1, Math.floor(v as number)) },
	{ key: 'focusPath', fallback: () => [] },
	{ key: 'levels', normalise: floorLevels, raw: true },
	{ key: 'root', fallback: () => null },
	{ key: 'bundleTension', raw: true },
	{ key: 'radialMode', fallback: () => 'tree' },
	{ key: 'edgeStyle', fallback: () => 'curved' },
	{ key: 'preset', fallback: () => defaultGraphPreset },
	{ key: 'mode', fallback: () => 'light' },
	{ key: 'label', raw: true },
	{ key: 'onselect', raw: true }
])

function resolve(config: GraphStateConfig): GraphConfigValues {
	const values = {} as Record<Key, unknown>
	for (const field of CONFIG_FIELDS) {
		const given = (config as Record<string, unknown>)[field.key]
		const value = field.raw ? given : (given ?? field.fallback())
		const { key, normalise } = field
		values[key] = normalise ? normalise(value, config) : value
	}
	return values as GraphConfigValues
}

/**
 * A graph's inputs — the one job `update()` has. The layout pipeline and the selection read
 * from here.
 *
 * `update()` FULLY re-applies config rather than merging deltas, matching `SparkState.update` —
 * so a prop reverting to undefined actually reverts. `apply()` is the merging verb, for a
 * component writing the few options its own controls drive into a state someone else owns.
 */
export class GraphConfig {
	#v = $state<GraphConfigValues>(resolve({}))
	/** The last FULL config, so `apply` can merge over it rather than reset around it. */
	#last: GraphStateConfig = {}

	constructor(config: GraphStateConfig = {}) {
		this.update(config)
	}

	update(config: GraphStateConfig = {}): void {
		this.#last = config
		// Field by field onto the one proxy, not a new object: each field stays its own signal,
		// so a re-render that leaves `nodes` alone does not re-trigger what reads only `nodes`.
		Object.assign(this.#v, resolve(config))
	}

	/** Merge a partial config over the last full one, leaving every key it does not name alone. */
	apply(config: Partial<GraphStateConfig>): GraphStateConfig {
		const merged = { ...this.#last, ...config }
		this.update(merged)
		return merged
	}

	/**
	 * Change the detail level from inside the component. `Graph`'s `density` PROP only reaches
	 * the state it owns; with a caller-supplied state — how all three views share one — a
	 * control that set the prop would render, click, and change nothing.
	 */
	setDensity(density: Density): void {
		this.#v.density = density
	}

	/** Change the grouping axes from inside the component — same reason as `setDensity`. */
	setGrouping(outer: NodeAxis, inner: NodeAxis | null = null): void {
		this.#v.groupBy = outer
		this.#v.nestBy = distinctNest(inner, outer)
	}

	get nodes() {
		return this.#v.nodes
	}
	get edges() {
		return this.#v.edges
	}
	get fields() {
		return this.#v.fields
	}
	get layout() {
		return this.#v.layout
	}
	get focus() {
		return this.#v.focus
	}
	get density() {
		return this.#v.density
	}
	get arrange() {
		return this.#v.arrange
	}
	get groupBy() {
		return this.#v.groupBy
	}
	get nestBy() {
		return this.#v.nestBy
	}
	get groupTint() {
		return this.#v.groupTint
	}
	get sizeBy() {
		return this.#v.sizeBy
	}
	get sizeScale() {
		return this.#v.sizeScale
	}
	get depth() {
		return this.#v.depth
	}
	get focusPath() {
		return this.#v.focusPath
	}
	get levels() {
		return this.#v.levels
	}
	get root() {
		return this.#v.root
	}
	get bundleTension() {
		return this.#v.bundleTension
	}
	get radialMode() {
		return this.#v.radialMode
	}
	get edgeStyle() {
		return this.#v.edgeStyle
	}
	get preset() {
		return this.#v.preset
	}
	get mode() {
		return this.#v.mode
	}
	get label() {
		return this.#v.label
	}
	get onselect() {
		return this.#v.onselect
	}
}

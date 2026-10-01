/**
 * What a press or a double-click on the graph does, as data.
 *
 * The state writes an intent onto each element (`data-graph-press`, `data-graph-open`, with
 * `data-graph-key`); the `interactions` action reads it back and calls `GraphState.act`, which
 * looks it up here. So the meaning of a click lives in one table — not in a handler on every
 * element — and each entry is testable on a bare state.
 */
import type { Breadcrumb } from './GraphDrill.svelte.js'
import type { GroupAction } from './GraphGroups.svelte.js'
import type { Cluster } from '../layout/types.js'

export type Intent =
	| 'select'
	| 'drill'
	| 'group'
	| 'expand'
	| 'crumb'
	| 'open-selected'
	| 'group-selected'
	| 'clear'

/** What an intent may call — the slice of `GraphState` the table needs. */
export type Actor = {
	select(id: string): void
	clear(): void
	drillInto(cluster: Cluster): unknown
	drillTo(path: string[]): unknown
	toggleGroup(id: string): void
	toggleExpanded(id: string): void
	isGroup(id: string): boolean
	groupOf(id: string): string | null
	boxFor(key: string): Cluster | undefined
	readonly breadcrumbs: Breadcrumb[]
	readonly drillTarget: Cluster | null
	readonly groupAction: GroupAction | null
}

type Perform = (graph: Actor, key: string) => void

/** A group toggles itself; a member of an open group folds that group back. */
const groupFor = (graph: Actor, key: string) => (graph.isGroup(key) ? key : (graph.groupOf(key) ?? key))

export const INTENTS: Record<Intent, Perform> = {
	select: (graph, key) => graph.select(key),
	drill: (graph, key) => {
		const cluster = graph.boxFor(key)
		if (cluster) graph.drillInto(cluster)
	},
	group: (graph, key) => graph.toggleGroup(groupFor(graph, key)),
	expand: (graph, key) => graph.toggleExpanded(key),
	crumb: (graph, key) => {
		const crumb = graph.breadcrumbs[Number(key)]
		if (crumb) graph.drillTo(crumb.path)
	},
	'open-selected': (graph) => {
		if (graph.drillTarget) graph.drillInto(graph.drillTarget)
	},
	'group-selected': (graph) => {
		if (graph.groupAction) graph.toggleGroup(graph.groupAction.group)
	},
	clear: (graph) => graph.clear()
}

/** Whether `value` names an intent — the action reads it from the DOM, where anything goes. */
export const isIntent = (value: string | null | undefined): value is Intent =>
	value !== null && value !== undefined && Object.hasOwn(INTENTS, value)

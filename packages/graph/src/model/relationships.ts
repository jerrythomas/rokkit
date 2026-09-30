import type { RoutedEdge } from '../layout/types.js'
import type { GraphEdge, GraphModel, GraphNode } from '../types.js'

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
 * The selected node's relationships — every edge touching it, in model order.
 *
 * Read from `model.edges`, the canonical unfiltered model, NOT from the layout's edges. A layout
 * filters: `cluster` drops edges whose endpoints were not laid out, and `neighborhood` lays out
 * only the focus's neighbourhood. Since `focus` and `value` are independent, reading the
 * layout's edges lets the state contradict itself: with `focus: 'audit.log'` (no neighbours) and
 * `value: 'public.orders'`, `relationships` would be `[]` while the entity row's `refCount` for
 * the same node is 1.
 *
 * Routed geometry is attached opportunistically — only for edges the active layout placed. A
 * relationship is a fact about the model; its geometry is a fact about the current view.
 *
 * An UNPLACED far end is reported too, with the raw name as the label — it is not a node, so
 * there is nothing to look up. Hiding it would be worse: "this references something we have not
 * indexed" is exactly what a reader of a partial graph needs to see.
 */
export function relationshipsOf(
	model: GraphModel,
	id: string | null,
	routedEdges: RoutedEdge[]
): Relationship[] {
	if (!id) return []
	// A plain Map on purpose: a call-local lookup, discarded when the caller re-derives.
	const routed = new Map(routedEdges.map((e) => [e.id, e]))

	const describe = (other: string, direction: 'in' | 'out', edge: GraphEdge): Relationship => {
		// normalizeGraph drops any edge whose endpoints do not resolve, so both ends of every
		// edge in model.edges are in byId. No `?? other` fallback: an unreachable branch cannot
		// be tested, and the package's 100% statement bar exists to keep that honest.
		const node = model.byId.get(other) as GraphNode
		return { direction, id: other, label: node.label, group: node.group, edge, routed: routed.get(edge.id) }
	}

	return model.edges.flatMap((edge): Relationship[] => {
		const ends = endpointsFor(edge, id)
		if (!ends) return []
		if (ends.self) return [describe(id, 'out', edge)]
		const { other, direction } = ends
		return edge.unplaced ? [{ direction, id: other, label: other, edge }] : [describe(other, direction, edge)]
	})
}

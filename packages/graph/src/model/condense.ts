/* Condensation (#166): a collapsed group node stands in for its members.
 *
 * The standard way to make a cyclic dependency graph readable is to collapse each strongly-
 * connected component into one node, after which what remains is a DAG. The HOST computes the
 * components and sends each as a node with `members`; this only draws them. Pure — a model and
 * the set of collapsed group ids in, the model the layout should see out.
 */
import type { GraphEdge, GraphModel } from '../types.js'
import { buildNeighbors } from './normalize.js'

/** Every group node, mapped to its members that exist in the model, in the order listed. */
export function groupsOf(model: GraphModel): Map<string, string[]> {
	const groups = new Map<string, string[]>()
	for (const node of model.nodes) {
		if (!node.members || node.members.length === 0) continue
		groups.set(
			node.id,
			node.members.filter((id) => model.byId.has(id))
		)
	}
	return groups
}

type Routing = {
	/** Member id → the collapsed group shown in its place. */
	into: Map<string, string>
	/** Ids not on screen: members of collapsed groups, and expanded groups with members shown. */
	hidden: Set<string>
}

/** A collapsed group takes its members' place. */
function collapseInto(group: string, members: string[], { into, hidden }: Routing): void {
	for (const member of members) {
		// A member listed in two groups belongs to the first; nesting is not modelled.
		if (!into.has(member)) into.set(member, group)
		hidden.add(member)
	}
}

function routingFor(groups: Map<string, string[]>, collapsed: Set<string>): Routing {
	const routing: Routing = { into: new Map(), hidden: new Set() }
	for (const [group, members] of groups) {
		if (collapsed.has(group)) collapseInto(group, members, routing)
		// Expanded, and its members are here: the group gives way to them. With no member in
		// the model yet it stays — there is nothing to show in its place.
		else if (members.length > 0) routing.hidden.add(group)
	}
	return routing
}

/**
 * An edge as the condensed view draws it, or null when it has no place there: inside a
 * collapsed group, or touching something hidden (a pre-aggregated edge to a group that is now
 * expanded into its members).
 */
/** Where an endpoint is drawn: its collapsed group, or itself. */
const shownAs = (id: string, into: Map<string, string>) => into.get(id) ?? id

function reroute(edge: GraphEdge, { into, hidden }: Routing): GraphEdge | null {
	const source = shownAs(edge.source, into)
	const target = shownAs(edge.target, into)
	if (hidden.has(source) || hidden.has(target)) return null
	const moved = source !== edge.source || target !== edge.target
	if (!moved) return edge
	if (source === target) return null
	// Row anchors named a member's rows; the group card has none.
	const { sourceRow: _s, targetRow: _t, ...rest } = edge
	return { ...rest, source, target }
}

const keyOf = (e: GraphEdge) => `${e.source}>${e.target}>${e.kind}>${e.relation ?? ''}`

/** Summed weight, or undefined when neither side carries one. */
const sumWeights = (a?: number, b?: number) =>
	a === undefined && b === undefined ? undefined : (a ?? 0) + (b ?? 0)

/** Two parallel edges as one: it stands for both, and is no single edge — so not the weakest. */
function merge(seen: GraphEdge, edge: GraphEdge, key: string): GraphEdge {
	const { weakest: _w, ...rest } = seen
	const merged: GraphEdge = { ...rest, id: `condensed:${key}`, count: (seen.count ?? 1) + 1 }
	const weight = sumWeights(seen.weight, edge.weight)
	if (weight !== undefined) merged.weight = weight
	return merged
}

/**
 * Parallel edges that rerouting created, folded into one: weights summed (when any carries
 * one), `count` = how many model edges it stands for. A folded edge is no longer any single
 * edge, so it is not the weakest one either.
 */
function fold(edges: GraphEdge[], original: GraphEdge[]): GraphEdge[] {
	const byKey = new Map<string, GraphEdge>()
	edges.forEach((edge, i) => {
		const key = keyOf(edge)
		const seen = byKey.get(key)
		if (seen) byKey.set(key, merge(seen, edge, key))
		// A rerouted edge is no longer the model edge it came from, so it takes a new id.
		else byKey.set(key, edge === original[i] ? edge : { ...edge, id: `condensed:${key}` })
	})
	return [...byKey.values()]
}

function condenseEdges(edges: GraphEdge[], routing: Routing): GraphEdge[] {
	const kept: GraphEdge[] = []
	const originals: GraphEdge[] = []
	for (const edge of edges) {
		const routed = reroute(edge, routing)
		if (!routed) continue
		kept.push(routed)
		originals.push(edge)
	}
	return fold(kept, originals)
}

/**
 * The model with each group in `collapsed` standing in for its members, and every other group
 * expanded into them. The model itself when it has no groups.
 */
export function condense(model: GraphModel, collapsed: Set<string>): GraphModel {
	const groups = groupsOf(model)
	if (groups.size === 0) return model

	const routing = routingFor(groups, collapsed)
	const nodes = model.nodes.filter((node) => !routing.hidden.has(node.id))
	const edges = condenseEdges(model.edges, routing)
	return {
		nodes,
		edges,
		overlays: condenseEdges(model.overlays, routing),
		byId: new Map(nodes.map((node) => [node.id, node])),
		neighbors: buildNeighbors(edges)
	}
}

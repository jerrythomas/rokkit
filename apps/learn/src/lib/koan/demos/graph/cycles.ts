/**
 * The cycles demo's HOST side (#166). `@rokkit/graph` computes no graph algorithm: it draws a
 * group node the host sends. So the demo plays host — it finds the strongly-connected
 * components of rokkit's own component imports and sends each as a collapsed group, flagging
 * the edge with the fewest occurrences inside it: the cheapest link to cut.
 */

type Edge = { source: string; target: string; weight?: number; weakest?: boolean }

/** Tarjan's algorithm, one job per method: number, recurse, and pop a finished component. */
class Tarjan {
	#out: Map<string, string[]>
	#index = new Map<string, number>()
	#low = new Map<string, number>()
	#stack: string[] = []
	#onStack = new Set<string>()
	#next = 0
	found: string[][] = []

	constructor(ids: string[], edges: Edge[]) {
		this.#out = new Map(ids.map((id) => [id, []]))
		for (const e of edges) this.#out.get(e.source)?.push(e.target)
		for (const id of ids) if (!this.#index.has(id)) this.#visit(id)
	}

	#visit(v: string): void {
		this.#index.set(v, this.#next)
		this.#low.set(v, this.#next)
		this.#next += 1
		this.#stack.push(v)
		this.#onStack.add(v)
		for (const w of this.#out.get(v) ?? []) this.#follow(v, w)
		if (this.#low.get(v) === this.#index.get(v)) this.#pop(v)
	}

	/** One edge v → w: recurse into an unseen node, or tighten v's low-link on a back edge. */
	#follow(v: string, w: string): void {
		if (!this.#out.has(w)) return
		if (!this.#index.has(w)) {
			this.#visit(w)
			this.#low.set(v, Math.min(this.#low.get(v)!, this.#low.get(w)!))
		} else if (this.#onStack.has(w)) {
			this.#low.set(v, Math.min(this.#low.get(v)!, this.#index.get(w)!))
		}
	}

	/** v is a component's root: everything above it on the stack is the component. */
	#pop(v: string): void {
		const component: string[] = []
		let w: string
		do {
			w = this.#stack.pop()!
			this.#onStack.delete(w)
			component.push(w)
		} while (w !== v)
		if (component.length > 1) this.found.push(component)
	}
}

/** The strongly-connected components with more than one member — the cycles. */
export function stronglyConnected(ids: string[], edges: Edge[]): string[][] {
	return new Tarjan(ids, edges).found
}

/**
 * The nodes plus one collapsed group per cycle, and the edges with each cycle's lightest
 * internal edge marked `weakest`. What a host like sensei sends for its Cycles view.
 */
export function withCycleGroups<N extends { id: string }>(
	nodes: N[],
	edges: Edge[]
): { nodes: (N | { id: string; label: string; kind: string; group: string; members: string[]; collapsed: boolean })[]; edges: Edge[] } {
	const sccs = stronglyConnected(
		nodes.map((n) => n.id),
		edges
	)
	const weakest = new Set<Edge>()
	for (const scc of sccs) {
		const inside = edges.filter((e) => scc.includes(e.source) && scc.includes(e.target))
		const lightest = inside.reduce((min, e) => ((e.weight ?? 0) < (min.weight ?? 0) ? e : min))
		weakest.add(lightest)
	}
	const groups = sccs.map((members, i) => ({
		id: `cycle:${i + 1}`,
		label: `${members.length} components in a cycle`,
		kind: 'cycle',
		group: 'cycle',
		members,
		collapsed: true
	}))
	return {
		nodes: [...nodes, ...groups],
		edges: edges.map((e) => (weakest.has(e) ? { ...e, weakest: true } : e))
	}
}

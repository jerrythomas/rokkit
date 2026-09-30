import { SvelteSet } from 'svelte/reactivity'
import { relationshipsOf } from '../model/relationships.js'
import type { Relationship } from '../model/relationships.js'
import type { RoutedEdge } from '../layout/types.js'
import type { GraphModel, GraphNode } from '../types.js'

type Sources = {
	/** The canonical model. */
	model: () => GraphModel
	/** The structural edges the active layout routed — geometry for relationships. */
	routedEdges: () => RoutedEdge[]
	/** The consumer's selection callback, read at call time (it is config, and can change). */
	onselect: () => ((id: string | null) => void) | undefined
}

/**
 * What the reader has picked and opened: the selected node, what it touches, and which cards
 * are expanded — plus the transitions that change them.
 */
export class GraphSelection {
	#sources: Sources
	#value = $state<string | null>(null)
	#expanded = new SvelteSet<string>()

	#related: SvelteSet<string>
	#entity: GraphNode | null
	/** From the canonical model, not the layout's filtered edges — see `relationshipsOf`. */
	#relationships: Relationship[]

	constructor(sources: Sources) {
		this.#sources = sources
		// Derived in the constructor, after `#sources` exists — a field initializer would read
		// it before it is assigned.
		this.#related = $derived(
			this.#value
				? new SvelteSet(sources.model().neighbors.get(this.#value) ?? [])
				: new SvelteSet<string>()
		)
		this.#entity = $derived(this.#value ? (sources.model().byId.get(this.#value) ?? null) : null)
		this.#relationships = $derived(
			relationshipsOf(sources.model(), this.#value, sources.routedEdges())
		)
	}

	get value(): string | null {
		return this.#value
	}
	get related(): SvelteSet<string> {
		return this.#related
	}
	get entity(): GraphNode | null {
		return this.#entity
	}
	get relationships(): Relationship[] {
		return this.#relationships
	}

	/** Take a value the CALLER supplied — no callback, it already knows. */
	adopt(id: string | null): void {
		this.#value = id
	}

	select(id: string): void {
		this.#value = id
		this.#sources.onselect()?.(id)
	}

	/**
	 * Drop the selection, and SAY SO.
	 *
	 * Found by dbd consuming the package: it owns `selected` in its route and branches on it
	 * to show the entity panel, so a silent clear left that panel open over nothing. A
	 * controlled consumer cannot observe an internal value — the callback is the only
	 * channel, which is why it carries `null` rather than being skipped.
	 *
	 * Guarded on an actual change, or a background click on an already-empty canvas
	 * round-trips through the consumer's setter on every stray click.
	 */
	clear(): void {
		if (this.#value === null) return
		this.#value = null
		this.#sources.onselect()?.(null)
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

	/** The set the layouts read to size expanded cards. */
	get expanded(): SvelteSet<string> {
		return this.#expanded
	}

	nodeState(id: string): 'selected' | 'related' | 'dim' | null {
		if (!this.#value) return null
		if (id === this.#value) return 'selected'
		return this.#related.has(id) ? 'related' : 'dim'
	}

	edgeState(edge: RoutedEdge): 'highlight' | 'dim' | null {
		if (!this.#value) return null
		return edge.fromKey === this.#value || edge.toKey === this.#value ? 'highlight' : 'dim'
	}
}

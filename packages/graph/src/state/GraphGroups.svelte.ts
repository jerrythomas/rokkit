import { SvelteSet } from 'svelte/reactivity'
import { groupsOf } from '../model/condense.js'
import type { GraphModel, GraphNode } from '../types.js'
import type { GraphConfig } from './GraphConfig.svelte.js'

/** What a drill bar can offer for the selection: open its group, or fold its group back. */
export type GroupAction = { kind: 'expand' | 'collapse'; group: string; label: string }

type Sources = {
	/** The CANONICAL model — before condensation, so every group and member is visible here. */
	model: () => GraphModel
	config: GraphConfig
}

/**
 * Which groups are collapsed (#166). A group starts as its node says (`collapsed`, default
 * true — a node with members is a group to fold); the reader toggles from there. The state
 * condenses the model through `collapsed` before any layout sees it.
 */
export class GraphGroups {
	#sources: Sources
	/** Groups the reader flipped from their starting state. */
	#toggled = new SvelteSet<string>()
	#groups: Map<string, string[]>
	#collapsed: Set<string>

	constructor(sources: Sources) {
		this.#sources = sources
		this.#groups = $derived(groupsOf(sources.model()))
		// A SvelteSet, as GraphSelection's `related` is: the house shape for a derived id set.
		this.#collapsed = $derived(
			new SvelteSet(
				[...this.#groups.keys()].filter((id) => this.#startsCollapsed(id) !== this.#toggled.has(id))
			)
		)
	}

	#node(id: string): GraphNode | undefined {
		return this.#sources.model().byId.get(id)
	}

	#startsCollapsed(id: string): boolean {
		return this.#node(id)?.collapsed ?? true
	}

	/** The collapsed group ids — what condensation reads. */
	get collapsed(): Set<string> {
		return this.#collapsed
	}

	isGroup(id: string): boolean {
		return this.#groups.has(id)
	}

	isCollapsed(id: string): boolean {
		return this.#collapsed.has(id)
	}

	/** How many members the group names — loaded or not, since the host may send them later. */
	memberCount(id: string): number {
		return this.#node(id)?.members?.length ?? 0
	}

	/** The EXPANDED group a node belongs to, or null — what a member collapses back into. */
	groupOf(id: string): string | null {
		for (const [group, members] of this.#groups) {
			if (!this.#collapsed.has(group) && members.includes(id)) return group
		}
		return null
	}

	/** Flip a group. False for a node that is not one. Tells the host either way it went. */
	toggle(id: string): boolean {
		const node = this.#node(id)
		if (!node || !this.isGroup(id)) return false
		const expanding = this.isCollapsed(id)
		if (this.#toggled.has(id)) this.#toggled.delete(id)
		else this.#toggled.add(id)
		const { onexpand, oncollapse } = this.#sources.config
		;(expanding ? onexpand : oncollapse)?.(id, node)
		return true
	}

	/** The selection's group action, or null when it is neither a collapsed group nor a member. */
	actionFor(selected: string | null): GroupAction | null {
		if (!selected) return null
		const label = (group: string) => this.#node(group)?.label ?? group
		if (this.isGroup(selected) && this.isCollapsed(selected)) {
			return { kind: 'expand', group: selected, label: label(selected) }
		}
		const group = this.groupOf(selected)
		return group ? { kind: 'collapse', group, label: label(group) } : null
	}
}

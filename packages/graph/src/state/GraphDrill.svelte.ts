import { LAYOUT_OPTIONS } from '../layout/options.js'
import type { Cluster } from '../layout/types.js'
import type { GraphModel } from '../types.js'
import type { GraphConfig } from './GraphConfig.svelte.js'

export type Breadcrumb = {
	/** The drill path this crumb returns to. `[]` is the root. */
	path: string[]
	/** The segment's name; null for the root, which the view names (`All`, a title…). */
	label: string | null
	/** Where the reader is now — the last crumb, which is shown but not a way back. */
	current: boolean
}

type Sources = {
	config: GraphConfig
	model: () => GraphModel
	/** The layout's registry key, or 'custom'. */
	layoutName: () => string
}

const isPrefix = (prefix: string[], path: string[]) =>
	prefix.length <= path.length && prefix.every((segment, i) => path[i] === segment)

const isThenable = (value: unknown): value is PromiseLike<unknown> =>
	value !== null && typeof value === 'object' && typeof (value as PromiseLike<unknown>).then === 'function'

/**
 * Drilling: moving `focusPath` — which containment subtree is the whole canvas — and telling the
 * host, who may have to FETCH that level (#165). docs/design/24-world-view.md, Decision 3.
 *
 * Drilling changes scope; it never selects. Only a layout that declares `focusPath` drills — a
 * custom LayoutFn might ignore it, and a no-op gesture is worse than none.
 *
 * A handler may return a promise: the state is `pending` until it settles, only the LATEST
 * drill's settlement counts (an older load finishing late changes nothing), and a rejection —
 * or a handler that throws — restores the previous path and exposes the error, because an
 * empty canvas would read as a broken level rather than a failed load.
 */
export class GraphDrill {
	#sources: Sources
	#pending = $state(false)
	#error = $state<unknown>(null)
	/** Bumped by every drill; a settlement for an older token is ignored. */
	#token = 0

	constructor(sources: Sources) {
		this.#sources = sources
	}

	get path(): string[] {
		return this.#sources.config.focusPath
	}

	get breadcrumbs(): Breadcrumb[] {
		const path = this.path
		return [
			{ path: [], label: null, current: path.length === 0 },
			...path.map((segment, i) => ({
				path: path.slice(0, i + 1),
				label: segment,
				current: i === path.length - 1
			}))
		]
	}

	get pending(): boolean {
		return this.#pending
	}

	/** Why the last drill failed, until the next drill. */
	get error(): unknown {
		return this.#error
	}

	/** Whether the active layout drills at all. */
	get enabled(): boolean {
		return LAYOUT_OPTIONS[this.#sources.layoutName()]?.includes('focusPath') === true
	}

	/**
	 * Whether a box can be opened: in a drilling layout, with an address (a pathless box has
	 * none), not already the canvas, and with something below it — in the data, or behind the
	 * host's loader.
	 */
	canDrill(box: Cluster): boolean {
		const path = box.path ?? []
		if (!this.enabled || path.length === 0 || isPrefix(path, this.path)) return false
		return !box.leaf || this.#sources.config.ondrill !== undefined
	}

	drillInto(box: Cluster): boolean {
		if (!this.canDrill(box)) return false
		const path = box.path as string[]
		const node = box.declared ? (this.#sources.model().byId.get(box.declared) ?? null) : null
		this.#move(path, () => this.#sources.config.ondrill?.(path, node))
		return true
	}

	/** Climb `levels` toward the root. False (and silent) when already there. */
	drillOut(levels = 1): boolean {
		if (this.path.length === 0) return false
		return this.drillTo(this.path.slice(0, Math.max(0, this.path.length - levels)))
	}

	/** Return to an ancestor — what a breadcrumb does. False for anything that is not one. */
	drillTo(path: string[]): boolean {
		if (path.length >= this.path.length || !isPrefix(path, this.path)) return false
		this.#move(path, () => this.#sources.config.ondrillup?.(path))
		return true
	}

	#move(path: string[], fire: () => unknown): void {
		const previous = this.path
		const token = ++this.#token
		this.#pending = false
		this.#error = null
		this.#setPath(path)

		const fail = (error: unknown) => {
			if (token !== this.#token) return
			this.#pending = false
			this.#error = error
			this.#setPath(previous)
		}
		let result: unknown
		try {
			result = fire()
		} catch (error) {
			fail(error)
			return
		}
		if (!isThenable(result)) return
		this.#pending = true
		result.then(() => {
			if (token === this.#token) this.#pending = false
		}, fail)
	}

	#setPath(path: string[]): void {
		this.#sources.config.setFocusPath(path)
		this.#sources.config.onfocuspath?.(path)
	}
}

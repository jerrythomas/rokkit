/**
 * LazyWrapper
 *
 * Extends Wrapper with lazy-loading support for tree nodes that use
 * LazyProxyItem. Overrides expand(), select(), and toggle() to detect
 * unloaded sentinel nodes (proxy.loaded === false) and trigger fetch()
 * before delegating to the base Wrapper behavior.
 *
 * Also provides loadMore() for root-level pagination via onlazyload callback.
 *
 * All navigation logic (next, prev, first, last, collapse, moveTo,
 * moveToValue, findByText, cancel, blur, extend, range) is inherited
 * from Wrapper — no duplication.
 */

import { Wrapper } from './wrapper.svelte.js'

// ─── LazyWrapper ───────────────────────────────────────────────────────────────

export class LazyWrapper extends Wrapper {
	#onlazyload

	/**
	 * @param {import('./proxy-tree.svelte.js').ProxyTree} proxyTree
	 * @param {{ onselect?: Function, onchange?: Function, onlazyload?: Function }} [options]
	 */
	constructor(proxyTree, options = {}) {
		super(proxyTree, options)
		this.#onlazyload = options.onlazyload
	}

	// ─── Root-level pagination ──────────────────────────────────────────────────

	/**
	 * Load more root-level items via the onlazyload callback.
	 * Appends results to the proxy tree.
	 */
	async loadMore() {
		if (!this.#onlazyload) return
		const result = await this.#onlazyload()
		if (Array.isArray(result) && result.length > 0) {
			this.proxyTree.append(result)
		}
	}

	// ─── Overrides: lazy sentinel detection ─────────────────────────────────────

	/**
	 * Expand focused group. If the node is an unloaded lazy sentinel
	 * (proxy.loaded === false), fetch children first then expand.
	 * Otherwise delegates to Wrapper's expand().
	 */
	expand(_path) {
		const key = this.focusedKey
		if (!key) return
		const node = this.flatView.find((n) => n.key === key)
		if (!node) return

		// Lazy unloaded node: fetch children, then expand
		if (!node.hasChildren && node.proxy.loaded === false) {
			node.proxy.fetch().then(() => {
				node.proxy.expanded = true
			})
			return
		}

		super.expand(_path)
	}

	/**
	 * Select item at path (or focusedKey). If the target is a group/expandable
	 * node with proxy.loaded === false, fetch children first then expand.
	 * Otherwise delegates to Wrapper's select().
	 */
	select(path) {
		const key = path ?? this.focusedKey
		if (!key) return
		const proxy = this.lookup.get(key)
		if (!proxy) return

		// Group with children: delegate to super (toggle expansion)
		if (proxy.hasChildren) {
			super.select(path)
			return
		}

		// Lazy sentinel: fetch children, then expand
		if (proxy.loaded === false) {
			proxy.fetch().then(() => { proxy.expanded = true })
			return
		}

		super.select(path)
	}

	/**
	 * Toggle expansion of group at path. If the node is an unloaded lazy
	 * sentinel, fetch children first then expand.
	 * Otherwise delegates to Wrapper's toggle().
	 */
	toggle(path) {
		const key = path ?? this.focusedKey
		if (!key) return
		const proxy = this.lookup.get(key)
		if (!proxy) return

		// Group with children: normal toggle
		if (proxy.hasChildren) {
			super.toggle(path)
			return
		}

		// Lazy sentinel: fetch children, then expand
		if (proxy.loaded === false) {
			proxy.fetch().then(() => { proxy.expanded = true })
			return
		}
	}
}

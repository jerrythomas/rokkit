/**
 * LazyWrapper
 *
 * Experimental Wrapper variant that derives flatView and lookup reactively
 * from the ProxyItem tree (via proxy.children $derived) instead of a static
 * ProxyNode tree.
 *
 * Key difference from Wrapper:
 *   Wrapper:     buildProxyList -> static ProxyNode tree -> buildFlatView(nodes)
 *   LazyWrapper: root ProxyItems -> flatView from proxy.children ($derived)
 *
 * Delegates data management (flatView, lookup) to ProxyTree while keeping
 * all navigation/selection logic here.
 *
 * When LazyProxyItem.fetch() calls set('children', [...]),
 * proxy.children recomputes (via #version), which triggers ProxyTree's flatView
 * and lookup to re-derive automatically -- no Wrapper recreation needed.
 */

import { AbstractWrapper } from './abstract-wrapper.js'
import { PROXY_ITEM_FIELDS } from './proxy-item.svelte.js'
import { ProxyTree } from './proxy-tree.svelte.js'

// ─── LazyWrapper ───────────────────────────────────────────────────────────────

export class LazyWrapper extends AbstractWrapper {
	// ─── Data ──────────────────────────────────────────────────────────────────

	#proxyTree // ProxyTree — manages root proxies, flatView, and lookup

	// Navigable items: exclude separators, spacers, and disabled items.
	#navigable = $derived(
		this.flatView.filter(
			(n) => n.type !== 'separator' && n.type !== 'spacer' && !n.proxy.disabled
		)
	)

	// ─── State ──────────────────────────────────────────────────────────────────

	#focusedKey = $state(null)

	// ─── Callbacks ──────────────────────────────────────────────────────────────

	#onselect
	#onchange
	#selectedValue = $state(undefined)

	/**
	 * @param {unknown[]} [items]
	 * @param {Partial<typeof PROXY_ITEM_FIELDS>} [fields]
	 * @param {{ onselect?: Function, onchange?: Function, createProxy?: (raw: *, fields: object, key: string, level: number) => ProxyItem }} [options]
	 */
	constructor(items = [], fields = {}, options = {}) {
		super()
		this.#proxyTree = new ProxyTree(items, fields, options)
		this.#onselect = options.onselect
		this.#onchange = options.onchange
	}

	// ─── Data accessors (delegated to ProxyTree) ─────────────────────────────

	get flatView() { return this.#proxyTree.flatView }

	/** @returns {Map<string, ProxyItem>} */
	get lookup() { return this.#proxyTree.lookup }

	/** @returns {ProxyTree} */
	get proxyTree() { return this.#proxyTree }

	// ─── IWrapper: state read by Navigator ─────────────────────────────────────

	get focusedKey() { return this.#focusedKey }

	// ─── IWrapper: movement ────────────────────────────────────────────────────

	next(_path) {
		const nav = this.#navigable
		if (!nav.length) return
		const idx = nav.findIndex((n) => n.key === this.#focusedKey)
		if (idx < nav.length - 1) this.#focusedKey = nav[idx + 1].key
	}

	prev(_path) {
		const nav = this.#navigable
		if (!nav.length) return
		const idx = nav.findIndex((n) => n.key === this.#focusedKey)
		if (idx > 0) this.#focusedKey = nav[idx - 1].key
	}

	first(_path) {
		const nav = this.#navigable
		if (nav.length) this.#focusedKey = nav[0].key
	}

	last(_path) {
		const nav = this.#navigable
		if (nav.length) this.#focusedKey = nav[nav.length - 1].key
	}

	expand(_path) {
		if (!this.#focusedKey) return
		const node = this.flatView.find((n) => n.key === this.#focusedKey)
		if (!node) return

		// Lazy unloaded node: fetch children, then expand
		if (!node.hasChildren && node.proxy.loaded === false) {
			node.proxy.fetch().then(() => {
				node.proxy.expanded = true
			})
			return
		}

		if (!node.hasChildren) return // regular leaf — no-op

		if (!node.proxy.expanded) {
			node.proxy.expanded = true
		} else {
			this.next(null)
		}
	}

	collapse(_path) {
		if (!this.#focusedKey) return
		const node = this.flatView.find((n) => n.key === this.#focusedKey)
		if (!node) return
		if (node.hasChildren && node.proxy.expanded) {
			node.proxy.expanded = false
		} else {
			const parts = this.#focusedKey.split('-')
			if (parts.length > 1) {
				parts.pop()
				this.#focusedKey = parts.join('-')
			}
		}
	}

	// ─── IWrapper: selection actions ───────────────────────────────────────────

	select(path) {
		const key = path ?? this.#focusedKey
		if (!key) return
		this.#focusedKey = key
		const proxy = this.#proxyTree.lookup.get(key)
		if (!proxy) return
		if (proxy.hasChildren) {
			proxy.expanded = !proxy.expanded
			return
		}
		// Lazy sentinel: fetch children, then expand
		if (proxy.loaded === false) {
			proxy.fetch().then(() => { proxy.expanded = true })
			return
		}
		if (proxy.value !== this.#selectedValue) {
			this.#selectedValue = proxy.value
			this.#onchange?.(proxy.value, proxy)
		}
		this.#onselect?.(proxy.value, proxy)
	}

	toggle(path) {
		const key = path ?? this.#focusedKey
		if (!key) return
		const proxy = this.#proxyTree.lookup.get(key)
		if (!proxy) return
		if (proxy.hasChildren) {
			proxy.expanded = !proxy.expanded
			return
		}
		// Lazy sentinel: fetch children, then expand
		if (proxy.loaded === false) {
			proxy.fetch().then(() => { proxy.expanded = true })
		}
	}

	moveTo(path) {
		if (path !== null) this.#focusedKey = path
	}

	moveToValue(v) {
		if (v === undefined || v === null) return
		for (const [key, proxy] of this.#proxyTree.lookup) {
			if (proxy.value === v) {
				this.#focusedKey = key
				this.#selectedValue = v
				return
			}
		}
	}

	cancel(_path) {}
	blur() {}
	extend(_path) {}
	range(_path) {}

	// ─── IWrapper: typeahead ───────────────────────────────────────────────────

	findByText(query, startAfterKey = null) {
		const nav = this.#navigable
		if (!nav.length) return null
		const q = query.toLowerCase()
		const startIdx = startAfterKey
			? nav.findIndex((n) => n.key === startAfterKey) + 1
			: 0
		for (let i = 0; i < nav.length; i++) {
			const node = nav[(startIdx + i) % nav.length]
			if (node.proxy.text.toLowerCase().startsWith(q)) return node.key
		}
		return null
	}
}

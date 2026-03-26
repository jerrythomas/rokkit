/**
 * Wrapper
 *
 * Navigation controller for persistent list/tree/sidebar components.
 * Accepts a ProxyTree instance for reactive data (flatView, lookup),
 * and provides full navigation, expansion, selection, and typeahead logic.
 *
 * ProxyTree owns the data layer: items -> proxies -> flatView + lookup.
 * Wrapper owns the navigation layer: focusedKey, movement, selection callbacks.
 *
 * Designed for any persistent (always-visible) component:
 *   - Sidebar navigation (links, collapsible groups)
 *   - List / Tree components
 *   - Any option list rendered inline
 *
 * Dropdown variants (Select, Menu) extend this class and override cancel() / blur()
 * to close the dropdown and return focus to the trigger.
 */

export class Wrapper {
	// ─── Data ──────────────────────────────────────────────────────────────────

	#proxyTree

	// flatView: re-derives from proxyTree's flatView, which itself re-derives
	// when any proxy.expanded or proxy.children changes.
	flatView = $derived(this.#proxyTree.flatView)

	// Navigable items: exclude separators, spacers, and disabled items.
	// This is the subset that keyboard navigation moves through.
	#navigable = $derived(
		this.flatView.filter((n) => n.type !== 'separator' && n.type !== 'spacer' && !n.proxy.disabled)
	)

	// ─── State ──────────────────────────────────────────────────────────────────

	#focusedKey = $state(null)

	// ─── Callbacks ──────────────────────────────────────────────────────────────

	#onselect
	#onchange
	#selectedValue = $state(undefined)

	#collapsible

	/**
	 * @param {import('./proxy-tree.svelte.js').ProxyTree} proxyTree
	 * @param {{ onselect?: Function, onchange?: Function, collapsible?: boolean }} [options]
	 */
	constructor(proxyTree, options = {}) {
		this.#proxyTree = proxyTree
		this.#onselect = options.onselect
		this.#onchange = options.onchange
		this.#collapsible = options.collapsible ?? true
	}

	// ─── IWrapper: state read by Navigator ─────────────────────────────────────

	get focusedKey() {
		return this.#focusedKey
	}

	// ─── IWrapper: movement (path passed through but ignored) ──────────────────

	/** Move focus to the next navigable item; clamp at end. */
	next(_path) {
		const nav = this.#navigable
		if (!nav.length) return
		const idx = nav.findIndex((n) => n.key === this.#focusedKey)
		if (idx < nav.length - 1) this.#focusedKey = nav[idx + 1].key
	}

	/** Move focus to the previous navigable item; clamp at start. */
	prev(_path) {
		const nav = this.#navigable
		if (!nav.length) return
		const idx = nav.findIndex((n) => n.key === this.#focusedKey)
		if (idx > 0) this.#focusedKey = nav[idx - 1].key
	}

	/** Move focus to the first navigable item. */
	first(_path) {
		const nav = this.#navigable
		if (nav.length) this.#focusedKey = nav[0].key
	}

	/** Move focus to the last navigable item. */
	last(_path) {
		const nav = this.#navigable
		if (nav.length) this.#focusedKey = nav[nav.length - 1].key
	}

	/**
	 * Expand focused group, or move focus into it if already open.
	 * No-op on leaf items. When collapsible=false groups are always open,
	 * so this only ever moves focus into the first child.
	 */
	expand(_path) {
		if (!this.#focusedKey) return
		const node = this.flatView.find((n) => n.key === this.#focusedKey)
		if (!node || !node.hasChildren) return
		if (!node.proxy.expanded) {
			node.proxy.expanded = true
		} else {
			// Already open — advance focus to first visible child
			this.next(null)
		}
	}

	/**
	 * Move focus to the parent key by stripping the last segment.
	 * No-op at root level.
	 */
	#focusParent() {
		const parts = this.#focusedKey.split('-')
		if (parts.length > 1) {
			parts.pop()
			this.#focusedKey = parts.join('-')
		}
	}

	/**
	 * Collapse focused group, or move focus to parent if already collapsed / leaf.
	 * At root level with no parent: no-op.
	 * When collapsible=false, skips closing the group but still moves focus to parent.
	 */
	// eslint-disable-next-line complexity
	collapse(_path) {
		if (!this.#focusedKey) return
		const node = this.flatView.find((n) => n.key === this.#focusedKey)
		if (!node) return
		const canCollapse = node.hasChildren && node.proxy.expanded && this.#collapsible
		if (canCollapse) {
			node.proxy.expanded = false
		} else {
			this.#focusParent()
		}
	}

	// ─── IWrapper: selection actions ───────────────────────────────────────────

	/**
	 * Fire value-change callbacks for a leaf selection.
	 * @param {*} proxy
	 */
	#selectLeaf(proxy) {
		if (proxy.value !== this.#selectedValue) {
			this.#selectedValue = proxy.value
			this.#onchange?.(proxy.value, proxy)
		}
		this.#onselect?.(proxy.value, proxy)
	}

	/**
	 * Select item at path (or focusedKey when path is null).
	 * Groups toggle expanded (only when collapsible=true). Leaves fire onchange and onselect callbacks.
	 */
	#selectProxy(proxy) {
		if (proxy.hasChildren) {
			if (this.#collapsible) proxy.expanded = !proxy.expanded
		} else {
			this.#selectLeaf(proxy)
		}
	}

	select(path) {
		const key = path ?? this.#focusedKey
		if (!key) return
		this.#focusedKey = key
		const proxy = this.#proxyTree.lookup.get(key)
		if (proxy) this.#selectProxy(proxy)
	}

	/**
	 * Toggle expansion of group at path — called by Navigator for accordion-trigger clicks.
	 * Unlike select(), this only applies to groups and never fires onselect.
	 * No-op when collapsible=false.
	 */
	// eslint-disable-next-line complexity
	toggle(path) {
		if (!this.#collapsible) return
		const key = path ?? this.#focusedKey
		if (key) {
			const proxy = this.#proxyTree.lookup.get(key)
			if (proxy?.hasChildren) proxy.expanded = !proxy.expanded
		}
	}

	/**
	 * Sync focused state to path — called by Navigator on focusin and typeahead match.
	 */
	moveTo(path) {
		if (path !== null) this.#focusedKey = path
	}

	/**
	 * Sync focused key to the item matching this semantic value.
	 * Used by controlled components (Toggle, Select) to keep navigation
	 * in sync when the bound value changes externally.
	 *
	 * @param {unknown} v
	 */
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

	/** Persistent list: no dropdown to close. Override in dropdown wrappers. */
	cancel(_path) {}

	/** Persistent list: no-op. Override in dropdown wrappers to close + restore trigger focus. */
	blur() {}

	/** Multiselect toggle — not yet implemented. */
	extend(_path) {}

	/** Multiselect range — not yet implemented. */
	range(_path) {}

	// ─── IWrapper: typeahead ───────────────────────────────────────────────────

	/**
	 * Return the key of the first navigable item whose text starts with query
	 * (case-insensitive). Wraps around. startAfterKey enables cycling.
	 * Returns null if no match.
	 *
	 * @param {string} query
	 * @param {string|null} [startAfterKey]
	 * @returns {string|null}
	 */
	findByText(query, startAfterKey = null) {
		const nav = this.#navigable
		if (!nav.length) return null
		const q = query.toLowerCase()
		const startIdx = startAfterKey ? nav.findIndex((n) => n.key === startAfterKey) + 1 : 0
		return this.#searchNav(nav, q, startIdx)
	}

	/**
	 * Search navigable items for a text prefix match starting from startIdx.
	 * @param {Array} nav
	 * @param {string} q
	 * @param {number} startIdx
	 * @returns {string|null}
	 */
	#searchNav(nav, q, startIdx) {
		for (let i = 0; i < nav.length; i++) {
			const node = nav[(startIdx + i) % nav.length]
			if (node.proxy.label.toLowerCase().startsWith(q)) return node.key
		}
		return null
	}

	// ─── Helpers for the component ─────────────────────────────────────────────

	/** @returns {Map<string, import('./proxy-item.svelte.js').ProxyItem>} */
	get lookup() {
		return this.#proxyTree.lookup
	}

	/** @returns {import('./proxy-tree.svelte.js').ProxyTree} */
	get proxyTree() {
		return this.#proxyTree
	}
}

/**
 * Wrapper
 *
 * Concrete AbstractWrapper implementation for persistent list/tree/sidebar components.
 * Extends AbstractWrapper with full navigation, expansion, selection, and typeahead
 * logic using ProxyItem + buildProxyList + buildFlatView.
 *
 * ProxyItem owns expanded/selected as $state. buildFlatView reads proxy.expanded
 * so $derived(buildFlatView(roots)) re-computes automatically on any expansion change.
 *
 * Designed for any persistent (always-visible) component:
 *   - Sidebar navigation (links, collapsible groups)
 *   - List / Tree components
 *   - Any option list rendered inline
 *
 * Dropdown variants (Select, Menu) extend this class and override cancel() / blur()
 * to close the dropdown and return focus to the trigger.
 */

import { AbstractWrapper } from './abstract-wrapper.js'
import { buildProxyList, buildFlatView } from './proxy-item.svelte.js'

export class Wrapper extends AbstractWrapper {
	// ─── Data ──────────────────────────────────────────────────────────────────

	#lookup // Map<key, ProxyItem>
	#roots  // ProxyNode[]

	// flatView: re-derives when any proxy.expanded changes (group open/close).
	// buildFlatView reads proxy.expanded ($state) for each group node,
	// so $derived correctly tracks all expansion changes.
	flatView = $derived(buildFlatView(this.#roots))

	// Navigable items: exclude separators, spacers, and disabled items.
	// This is the subset that keyboard navigation moves through.
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
	 * @param {Partial<import('./proxy-item.svelte.js').PROXY_ITEM_FIELDS>} [fields]
	 * @param {{ onselect?: (value: unknown, proxy: import('./proxy-item.svelte.js').ProxyItem) => void, onchange?: (value: unknown, proxy: import('./proxy-item.svelte.js').ProxyItem) => void }} [options]
	 */
	constructor(items = [], fields = {}, options = {}) {
		super()
		const { lookup, roots } = buildProxyList(items, fields)
		this.#lookup = lookup
		this.#roots = roots
		this.#onselect = options.onselect
		this.#onchange = options.onchange
	}

	// ─── IWrapper: state read by Navigator ─────────────────────────────────────

	get focusedKey() { return this.#focusedKey }

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
	 * No-op on leaf items.
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
	 * Collapse focused group, or move focus to parent if already collapsed / leaf.
	 * At root level with no parent: no-op.
	 */
	collapse(_path) {
		if (!this.#focusedKey) return
		const node = this.flatView.find((n) => n.key === this.#focusedKey)
		if (!node) return
		if (node.hasChildren && node.proxy.expanded) {
			node.proxy.expanded = false
		} else {
			// Move to parent: strip the last segment from the key
			const parts = this.#focusedKey.split('-')
			if (parts.length > 1) {
				parts.pop()
				this.#focusedKey = parts.join('-')
			}
			// At root level (no '-'): no-op — already at root
		}
	}

	// ─── IWrapper: selection actions ───────────────────────────────────────────

	/**
	 * Select item at path (or focusedKey when path is null).
	 * Groups toggle expanded. Leaves fire onchange (value differs) and onselect callbacks.
	 */
	select(path) {
		const key = path ?? this.#focusedKey
		if (!key) return
		this.#focusedKey = key
		const proxy = this.#lookup.get(key)
		if (!proxy) return
		if (proxy.hasChildren) {
			proxy.expanded = !proxy.expanded
		} else {
			if (proxy.value !== this.#selectedValue) {
				this.#selectedValue = proxy.value
				this.#onchange?.(proxy.value, proxy)
			}
			this.#onselect?.(proxy.value, proxy)
		}
	}

	/**
	 * Toggle expansion of group at path — called by Navigator for accordion-trigger clicks.
	 * Unlike select(), this only applies to groups and never fires onselect.
	 */
	toggle(path) {
		const key = path ?? this.#focusedKey
		if (!key) return
		const proxy = this.#lookup.get(key)
		if (proxy?.hasChildren) proxy.expanded = !proxy.expanded
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
		for (const [key, proxy] of this.#lookup) {
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
		const startIdx = startAfterKey
			? nav.findIndex((n) => n.key === startAfterKey) + 1
			: 0
		for (let i = 0; i < nav.length; i++) {
			const node = nav[(startIdx + i) % nav.length]
			if (node.proxy.label.toLowerCase().startsWith(q)) return node.key
		}
		return null
	}

	// ─── Helpers for the component ─────────────────────────────────────────────

	/** @returns {Map<string, import('./proxy-item.svelte.js').ProxyItem>} */
	get lookup() { return this.#lookup }
}

/**
 * LazyWrapper
 *
 * Experimental Wrapper variant that derives flatView and lookup reactively
 * from the ProxyItem tree (via proxy.children $derived) instead of a static
 * ProxyNode tree.
 *
 * Key difference from Wrapper:
 *   Wrapper:     buildProxyList → static ProxyNode tree → buildFlatView(nodes)
 *   LazyWrapper: root ProxyItems → flatView from proxy.children ($derived)
 *
 * When LazyProxyItem.fetch() calls set('children', [...]),
 * proxy.children recomputes (via #version), which triggers flatView
 * and lookup to re-derive automatically — no Wrapper recreation needed.
 */

import { AbstractWrapper } from './abstract-wrapper.js'
import { ProxyItem, PROXY_ITEM_FIELDS } from './proxy-item.svelte.js'

// ─── Tree line type computation ────────────────────────────────────────────────

// Maps a parent's line type to the continuation type shown at the same column
// in child rows below it. 'child'→'sibling' (line continues), 'last'→'empty' (branch ended).
const NEXT_LINE = { child: 'sibling', last: 'empty', sibling: 'sibling', empty: 'empty', icon: 'empty' }

// ─── Reactive tree traversal utilities ─────────────────────────────────────────

/**
 * Build flat view by walking proxy.children ($derived) recursively.
 * Reads proxy.expanded ($state) and proxy.children ($derived), so any
 * $derived wrapping this function re-computes on expansion or children changes.
 *
 * Computes lineTypes per node during the walk — no second pass needed.
 * lineTypes is an array of connector types for rendering tree lines:
 *   'child'   — ├ branch connector
 *   'last'    — └ last branch connector
 *   'sibling' — │ vertical continuation line
 *   'empty'   — (blank space)
 *   'icon'    — expand/collapse toggle slot
 *
 * @param {ProxyItem[]} proxies
 * @param {string[]} [parentLineTypes]  Line types of the parent node (for computing inherited connectors)
 * @returns {{ key: string, proxy: ProxyItem, level: number, hasChildren: boolean, isExpandable: boolean, type: string, lineTypes: string[] }[]}
 */
function buildReactiveFlatView(proxies, parentLineTypes = []) {
	const result = []
	for (let i = 0; i < proxies.length; i++) {
		const proxy = proxies[i]
		const children = proxy.children // reads $derived — registers dependency
		const hasChildren = children.length > 0
		const isExpandable = hasChildren || proxy.get('children') === true // sentinel: lazy-loadable
		const isLast = i === proxies.length - 1
		const position = isLast ? 'last' : 'child'

		// Compute line types: inherit parent's continuations + current position + icon/empty
		const inherited = parentLineTypes.slice(0, -1).map((t) => NEXT_LINE[t] ?? 'empty')
		if (parentLineTypes.length > 0) inherited.push(position)
		const lineTypes = [...inherited, isExpandable ? 'icon' : 'empty']

		result.push({
			key: proxy.key,
			proxy,
			level: proxy.level,
			hasChildren,
			isExpandable,
			type: proxy.type,
			lineTypes
		})
		if (hasChildren && proxy.expanded) {
			result.push(...buildReactiveFlatView(children, lineTypes))
		}
	}
	return result
}

/**
 * Build lookup Map by walking proxy.children ($derived) recursively.
 * Traverses ALL children (not just expanded) so keys are available
 * for selection and navigation even before a group is opened.
 *
 * @param {ProxyItem[]} proxies
 * @param {Map<string, ProxyItem>} [map]
 * @returns {Map<string, ProxyItem>}
 */
function buildReactiveLookup(proxies, map = new Map()) {
	for (const proxy of proxies) {
		map.set(proxy.key, proxy)
		const children = proxy.children
		if (children.length > 0) {
			buildReactiveLookup(children, map)
		}
	}
	return map
}

// ─── LazyWrapper ───────────────────────────────────────────────────────────────

export class LazyWrapper extends AbstractWrapper {
	// ─── Data ──────────────────────────────────────────────────────────────────

	#rootProxies // ProxyItem[] — stable root instances, set once in constructor

	// Reactive flatView: re-derives when proxy.expanded OR proxy.children changes.
	flatView = $derived(buildReactiveFlatView(this.#rootProxies))

	// Reactive lookup: re-derives when proxy.children changes anywhere in the tree.
	#lookup = $derived(buildReactiveLookup(this.#rootProxies))

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
		const mergedFields = { ...PROXY_ITEM_FIELDS, ...fields }
		const factory = options.createProxy ?? ((raw, f, key, level) => new ProxyItem(raw, f, key, level))
		this.#rootProxies = (items ?? []).map((raw, i) => factory(raw, mergedFields, String(i), 1))
		this.#onselect = options.onselect
		this.#onchange = options.onchange
	}

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
		const proxy = this.#lookup.get(key)
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
		const proxy = this.#lookup.get(key)
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
		for (const [key, proxy] of this.#lookup) {
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

	// ─── Helpers ──────────────────────────────────────────────────────────────

	/** @returns {Map<string, ProxyItem>} */
	get lookup() { return this.#lookup }
}

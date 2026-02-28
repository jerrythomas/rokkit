/**
 * ProxyItem
 *
 * Wraps a raw item (object or primitive) and provides uniform field access.
 *
 * #raw   — always the original input, never mutated.
 * #item  — the object used for all field accesses:
 *            for objects: same reference as #raw
 *            for primitives: { [fields.text]: raw, [fields.value]: raw }
 *          This normalisation means get() and all getters work through the
 *          same field-mapping path with no special-casing.
 * #key   — path-based identifier ('0', '0-1', '0-1-2', …) assigned by
 *          buildProxyList and propagated into children automatically.
 * #level — nesting depth: always equals key.split('-').length.
 *          (1 = root, 2 = first-level children, 3 = grandchildren, …)
 *
 * get(fieldName)  — maps semantic name → raw key → #item value.
 *                   For field-mapped attributes only (text, value, icon, …).
 *                   Structural props (key, level) and control state
 *                   (expanded, selected) are accessed directly as properties.
 *
 * children — auto-wrapped as ProxyItem instances via $derived, with their
 *            keys and levels already set. Stable references so
 *            $derived(buildFlatView) correctly tracks nested expanded state.
 *
 * Control state (expanded / selected) — two modes:
 *   external: item has the field → proxy reads/writes through to #item
 *   internal: item lacks the field → proxy owns it as $state
 *   Primitive items always use internal mode (their #item has no state fields).
 *
 * ProxyItems are created once and never recreated — this keeps $state
 * signals stable so $derived computations track them correctly.
 */

import { DEFAULT_FIELDS } from '../constants.js'
export { DEFAULT_FIELDS }

// ─── ProxyItem ────────────────────────────────────────────────────────────────

export class ProxyItem {
	#raw    // original input — never touched after construction
	#item   // normalised object used for all field accesses
	#fields
	#key    // path-based key e.g. '0', '0-1', '0-1-2'
	#level  // nesting depth: 0 = root

	// Control state — always read from here so $derived tracks changes.
	// Initialised from #item field when present (external mode).
	#expanded = $state(false)
	#selected = $state(false)

	// Children auto-wrapped as ProxyItem instances with keys + levels assigned.
	// $derived ensures stable references: same ProxyItem instances returned on
	// every access, so $derived(buildFlatView) can track their expanded state.
	#children = $derived(this.#buildChildren())

	/**
	 * @param {*} raw   Raw item — object or primitive (string, number, …)
	 * @param {Partial<typeof DEFAULT_FIELDS>} [fields]
	 * @param {string} [key]    Path-based key assigned by buildProxyList
	 * @param {number} [level]  Nesting depth (0 = root)
	 */
	constructor(raw, fields = {}, key = '', level = 0) {
		this.#fields = { ...DEFAULT_FIELDS, ...fields }
		this.#raw = raw
		this.#key = key
		this.#level = level

		// Normalise primitives: #item is always an object.
		// Both text and value fields point to the primitive so all accessors work uniformly.
		this.#item =
			raw !== null && typeof raw === 'object'
				? raw
				: { [this.#fields.text]: raw, [this.#fields.value]: raw }

		// Sync initial control state from #item fields when present
		const ef = this.#fields.expanded
		const sf = this.#fields.selected
		if (ef in this.#item) this.#expanded = Boolean(this.#item[ef])
		if (sf in this.#item) this.#selected = Boolean(this.#item[sf])
	}

	// ─── Internal: build wrapped children ────────────────────────────────────

	#buildChildren() {
		const raw = this.#item[this.#fields.children]
		if (!Array.isArray(raw) || raw.length === 0) return []
		return raw.map(
			(child, i) =>
				new ProxyItem(
					child,
					this.#fields,
					this.#key ? `${this.#key}-${i}` : String(i),
					this.#level + 1
				)
		)
	}

	// ─── Structural props ─────────────────────────────────────────────────────

	get key()   { return this.#key }
	get level() { return this.#level }

	// ─── Generic field accessor ───────────────────────────────────────────────
	//
	// Maps a semantic field name to the #item value via the fields config.
	// For field-mapped attributes only: text, value, icon, href, description, …
	// Falls back to using fieldName directly as a raw key when not in config.

	/**
	 * @param {string} fieldName  Semantic name, e.g. 'icon', 'href', 'description'
	 * @returns {*}
	 */
	get(fieldName) {
		const rawKey = this.#fields[fieldName] ?? fieldName
		return this.#item[rawKey]
	}

	// ─── Field-mapped accessors ───────────────────────────────────────────────
	//
	// text    — never undefined; falls back to ''
	// value   — falls back to #raw (the original item) when no value field is set
	// snippet — identifies which snippet to use when rendering this item

	get text()    { return this.#item[this.#fields.text]    ?? '' }
	get value()   { return this.#item[this.#fields.value]   ?? this.#raw }
	get icon()    { return this.#item[this.#fields.icon] }
	get href()    { return this.#item[this.#fields.href] }
	get snippet() { return this.#item[this.#fields.snippet] }

	// ─── Computed props ───────────────────────────────────────────────────────

	get disabled() { return this.#item[this.#fields.disabled] === true }

	/** True only for object items with a non-empty children array. */
	get hasChildren() {
		return (
			this.#raw !== null &&
			typeof this.#raw === 'object' &&
			Array.isArray(this.#item[this.#fields.children]) &&
			this.#item[this.#fields.children].length > 0
		)
	}

	/** Returns wrapped ProxyItem children (empty array for primitives and leaf items). */
	get children() { return this.#children }

	get type() {
		const t = this.#item[this.#fields.type]
		if (t === 'separator' || t === 'spacer') return t
		return this.hasChildren ? 'group' : 'item'
	}

	// ─── Control state (expanded / selected) ─────────────────────────────────
	//
	// Always read from internal $state so $derived computations track changes.
	// Setters write back to #item only when the field exists there
	// (objects with expanded/selected fields — external mode).
	// Primitive items normalised to { text, value } never have these fields,
	// so they always use internal mode.

	get expanded() { return this.#expanded }
	set expanded(v) {
		this.#expanded = v
		const ef = this.#fields.expanded
		if (ef in this.#item) this.#item[ef] = v
	}

	get selected() { return this.#selected }
	set selected(v) {
		this.#selected = v
		const sf = this.#fields.selected
		if (sf in this.#item) this.#item[sf] = v
	}
}

// ─── ProxyNode type (internal tree node) ──────────────────────────────────────
// { key: string, proxy: ProxyItem, children: ProxyNode[] }

// ─── buildProxyList ───────────────────────────────────────────────────────────

/**
 * Build a hierarchical proxy structure from raw items.
 *
 * Creates top-level ProxyItems with their keys ('0', '1', …) and level (1).
 * Each ProxyItem's #buildChildren() propagates keys and levels into children
 * automatically, so buildNodes only needs to traverse — no depth tracking.
 *
 * Returns:
 *   lookup  Map<key, ProxyItem>  — flat lookup for O(1) access by key
 *   roots   ProxyNode[]          — tree structure used to derive flatView
 *
 * Proxies are stable — created once here and never recreated.
 * This is the invariant that makes $derived(buildFlatView(roots)) work:
 * the $state signals inside each ProxyItem remain the same objects,
 * so reactive subscriptions stay valid across multiple re-computations.
 *
 * @param {*[]} items
 * @param {Partial<typeof DEFAULT_FIELDS>} [fields]
 * @returns {{ lookup: Map<string, ProxyItem>, roots: ProxyNode[] }}
 */
export function buildProxyList(items, fields = {}) {
	const lookup = new Map()

	function buildNodes(proxies) {
		return proxies.map((proxy) => {
			lookup.set(proxy.key, proxy)
			const children = proxy.hasChildren ? buildNodes(proxy.children) : []
			return { key: proxy.key, proxy, children }
		})
	}

	const roots = buildNodes(
		(items ?? []).map((raw, i) => new ProxyItem(raw, fields, String(i), 1))
	)
	return { lookup, roots }
}

// ─── buildFlatView ────────────────────────────────────────────────────────────

/**
 * Build the flat ordered array of visible nodes from the proxy tree.
 *
 * Reads proxy.expanded for each group node — when expanded state changes,
 * any $derived that calls this function will re-compute.
 *
 * Level comes directly from proxy.level (set during buildProxyList).
 *
 * Separators and spacers appear in the flat view for rendering but are
 * never "focused" — the Wrapper's navigation skips them.
 *
 * @param {{ key: string, proxy: ProxyItem, children: *[] }[]} nodes
 * @returns {{ key: string, proxy: ProxyItem, level: number, hasChildren: boolean, type: string }[]}
 */
export function buildFlatView(nodes) {
	const result = []
	for (const node of nodes) {
		result.push({
			key: node.key,
			proxy: node.proxy,
			level: node.proxy.level,
			hasChildren: node.children.length > 0,
			type: node.proxy.type
		})
		// Reading proxy.expanded here registers it as a reactive dependency
		if (node.children.length > 0 && node.proxy.expanded) {
			result.push(...buildFlatView(node.children))
		}
	}
	return result
}

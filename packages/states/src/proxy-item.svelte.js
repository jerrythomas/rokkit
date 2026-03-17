/**
 * ProxyItem
 *
 * Wraps a raw item (object or primitive) and provides uniform field access.
 *
 * #raw   — always the original input, never mutated.
 * #item  — the object used for all field accesses:
 *            for objects: same reference as #raw
 *            for primitives: { [fields.label]: raw, [fields.value]: raw }
 *          This normalisation means get() and all getters work through the
 *          same field-mapping path with no special-casing.
 * #key   — path-based identifier ('0', '0-1', '0-1-2', …) assigned by
 *          ProxyTree and propagated into children automatically.
 * #level — nesting depth: always equals key.split('-').length.
 *          (1 = root, 2 = first-level children, 3 = grandchildren, …)
 *
 * get(fieldName)  — maps semantic name → raw key → #item value.
 *                   For field-mapped attributes only (label, value, icon, …).
 *                   Structural props (key, level) and control state
 *                   (expanded, selected) are accessed directly as properties.
 *
 * Direct getters: label, value, id — primary access.
 *   All other fields via get(fieldName).
 *
 * children — auto-wrapped as ProxyItem instances via $derived, with their
 *            keys and levels already set. Stable references so
 *            $derived correctly tracks nested expanded state.
 *
 * Control state (expanded / selected) — two modes:
 *   external: item has the field → proxy reads/writes through to #item
 *   internal: item lacks the field → proxy owns it as $state
 *   Primitive items always use internal mode (their #item has no state fields).
 *
 * ProxyItems are created once and never recreated — this keeps $state
 * signals stable so $derived computations track them correctly.
 */

import { BASE_FIELDS } from '@rokkit/core'
export { BASE_FIELDS }

// Auto-increment counter for generating stable unique IDs.
let _nextId = 1

// ─── ProxyItem ────────────────────────────────────────────────────────────────

export class ProxyItem {
	#raw // original input — never touched after construction
	#item // normalised object used for all field accesses
	#fields
	#id // stable unique identifier — from item field or auto-generated
	#key // path-based key e.g. '0', '0-1', '0-1-2'
	#level // nesting depth: 1 = root

	// Control state — always read from here so $derived tracks changes.
	// Initialised from #item field when present (external mode).
	#expanded = $state(false)
	#selected = $state(false)

	// Version counter — incremented by set() to trigger #children recomputation.
	// $derived reads this so it re-derives when set('children', ...) is called.
	#version = $state(0)

	// Children auto-wrapped as ProxyItem instances with keys + levels assigned.
	// $derived ensures stable references: same ProxyItem instances returned on
	// every access, so $derived can track their expanded state.
	#children = $derived(this.#buildChildren())

	/**
	 * Normalise a raw value to an object for uniform field access.
	 * @param {*} raw
	 * @returns {object}
	 */
	#normalizeItem(raw) {
		return raw !== null && typeof raw === 'object'
			? raw
			: { [this.#fields.label]: raw, [this.#fields.value]: raw }
	}

	/**
	 * Sync initial control state from item fields when present.
	 */
	#syncControlState() {
		const ef = this.#fields.expanded
		const sf = this.#fields.selected
		if (ef in this.#item) this.#expanded = Boolean(this.#item[ef])
		if (sf in this.#item) this.#selected = Boolean(this.#item[sf])
	}

	/**
	 * @param {*} raw   Raw item — object or primitive (string, number, …)
	 * @param {Partial<typeof BASE_FIELDS>} [fields]
	 * @param {string} [key]    Path-based key assigned by ProxyTree
	 * @param {number} [level]  Nesting depth (1 = root)
	 */
	constructor(raw, fields = {}, key = '', level = 0) {
		this.#fields = { ...BASE_FIELDS, ...(fields && typeof fields === 'object' ? fields : {}) }
		this.#raw = raw
		this.#key = key
		this.#level = level
		this.#item = this.#normalizeItem(raw)
		this.#id = this.#item[this.#fields.id] ?? `proxy-${_nextId++}`
		this.#syncControlState()
	}

	// ─── Internal: build wrapped children ────────────────────────────────────

	#buildChildren() {
		void this.#version // reactive dependency — triggers recompute after set()
		const raw = this.#item[this.#fields.children]
		if (!Array.isArray(raw) || raw.length === 0) return []
		return raw.map((child, i) =>
			this._createChild(
				child,
				this.#fields,
				this.#key ? `${this.#key}-${i}` : String(i),
				this.#level + 1
			)
		)
	}

	/**
	 * Factory method for creating child proxies. Override in subclasses
	 * to produce specialised children (e.g. LazyProxyItem).
	 * @param {*} raw
	 * @param {Partial<typeof BASE_FIELDS>} fields
	 * @param {string} key
	 * @param {number} level
	 * @returns {ProxyItem}
	 */
	_createChild(raw, fields, key, level) {
		return new ProxyItem(raw, fields, key, level)
	}

	// ─── Structural props ─────────────────────────────────────────────────────

	get key() {
		return this.#key
	}
	get level() {
		return this.#level
	}
	/** Stable unique identifier — from item's id field, or auto-generated. */
	get id() {
		return this.#id
	}
	/** The original input passed to the constructor — never mutated. */
	get original() {
		return this.#raw
	}
	/** The merged field-mapping configuration. */
	get fields() {
		return this.#fields
	}

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

	/**
	 * Write a value back to the underlying item through the field mapping.
	 * For object items, this modifies the original raw item (since #item === #raw).
	 * Increments the version counter so $derived(#buildChildren()) re-computes.
	 *
	 * @param {string} fieldName  Semantic name, e.g. 'children', 'text'
	 * @param {*} value
	 */
	set(fieldName, value) {
		const rawKey = this.#fields[fieldName] ?? fieldName
		this.#item[rawKey] = value
		this.#version++
	}

	/**
	 * Write directly to the original raw item, bypassing field mapping.
	 * Advanced operation for when the caller needs to update the source data.
	 * Accepts either (field, value) or an object for batch updates.
	 * Increments version so $derived(#buildChildren()) re-computes.
	 *
	 * @param {string|object} fieldOrBatch  Raw key name, or { key: value, … }
	 * @param {*} [value]
	 */
	mutate(fieldOrBatch, value) {
		if (typeof fieldOrBatch === 'object' && fieldOrBatch !== null) {
			for (const [k, v] of Object.entries(fieldOrBatch)) {
				this.#raw[k] = v
			}
		} else {
			this.#raw[fieldOrBatch] = value
		}
		this.#version++
	}

	// ─── Field-mapped accessors ───────────────────────────────────────────────

	get label() {
		return this.#item[this.#fields.label] ?? ''
	}
	get value() {
		return this.#item[this.#fields.value] ?? this.#raw
	}
	// All other fields via get('icon'), get('href'), get('snippet'), etc.

	// ─── Computed props ───────────────────────────────────────────────────────

	get disabled() {
		return this.#item[this.#fields.disabled] === true
	}

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
	get children() {
		return this.#children
	}

	get type() {
		const t = this.#item[this.#fields.type]
		if (t === 'separator' || t === 'spacer') return t
		return this.hasChildren ? 'group' : 'item'
	}

	// ─── Control state (expanded / selected) ─────────────────────────────────

	get expanded() {
		return this.#expanded
	}
	set expanded(v) {
		this.#expanded = v
		const ef = this.#fields.expanded
		if (ef in this.#item) this.#item[ef] = v
	}

	get selected() {
		return this.#selected
	}
	set selected(v) {
		this.#selected = v
		const sf = this.#fields.selected
		if (sf in this.#item) this.#item[sf] = v
	}
}

// ─── LazyProxyItem ───────────────────────────────────────────────────────────

/**
 * LazyProxyItem
 *
 * Extends ProxyItem with lazy-loading support. When a lazyLoad function
 * is provided, children are fetched on demand via fetch().
 *
 * #lazyLoad  — async function (value, raw) => children[] — null when not lazy
 * #loaded    — true when: lazyLoad is null, or node already has children array,
 *              or after successful fetch(). false only for sentinel nodes
 *              (children === true) that need fetching.
 * #loading   — true during async fetch(), false otherwise. Used for spinner UI.
 *
 * After fetch(), uses set('children', result) to update the underlying item
 * and trigger #children recomputation via the version counter.
 *
 * The lazyLoad function is propagated to all children automatically via
 * _createChild override.
 */
export class LazyProxyItem extends ProxyItem {
	#lazyLoad
	#loaded = $state(true)
	#loading = $state(false)

	/**
	 * @param {*} raw
	 * @param {Partial<typeof BASE_FIELDS>} [fields]
	 * @param {string} [key]
	 * @param {number} [level]
	 * @param {((value: unknown, raw: unknown) => Promise<unknown[]>) | null} [lazyLoad]
	 */
	// eslint-disable-next-line max-params
	constructor(raw, fields = {}, key = '', level = 0, lazyLoad = null) {
		super(raw, fields, key, level)
		this.#lazyLoad = lazyLoad
		this.#loaded = this.#resolveLoaded(lazyLoad)
	}

	/**
	 * Determine initial loaded state.
	 * Loaded if no lazyLoad function, or children is not a sentinel (true).
	 * @param {Function|null} lazyLoad
	 * @returns {boolean}
	 */
	#resolveLoaded(lazyLoad) {
		return lazyLoad === null || this.get('children') !== true
	}

	get loaded() {
		return this.#loaded
	}
	get loading() {
		return this.#loading
	}

	/**
	 * Fetch children via the lazyLoad function.
	 * No-op if lazyLoad is null, already loaded, or currently loading.
	 * After fetching, writes children to the underlying item via set().
	 */
	async fetch() {
		if (!this.#lazyLoad || this.#loaded || this.#loading) return
		this.#loading = true
		try {
			const children = await this.#lazyLoad(this.value, this.original)
			this.set('children', children)
			this.#loaded = true
		} finally {
			this.#loading = false
		}
	}

	/** @override — propagate lazyLoad to children */
	_createChild(raw, fields, key, level) {
		return new LazyProxyItem(raw, fields, key, level, this.#lazyLoad)
	}
}

/**
 * ProxyTree
 *
 * Reactive data layer that manages a tree of ProxyItem instances.
 * Derives flatView (for rendering) and lookup (for O(1) access) reactively
 * from the root proxies and their children.
 *
 * Used by both Wrapper and LazyWrapper as the shared data model.
 *
 * Key design:
 *   #rootProxies is $state([]) — reassigned (not mutated) so $derived re-computes.
 *   flatView and lookup are $derived from #rootProxies, reading proxy.children
 *   and proxy.expanded recursively, so they automatically re-derive on any
 *   expansion or children change anywhere in the tree.
 */

import { BASE_FIELDS } from '@rokkit/core'
import { SvelteMap } from 'svelte/reactivity'
import { ProxyItem } from './proxy-item.svelte.js'

// ─── Tree line type computation ────────────────────────────────────────────────

// Maps a parent's line type to the continuation type shown at the same column
// in child rows below it. 'child'→'sibling' (line continues), 'last'→'empty' (branch ended).
const NEXT_LINE = {
	child: 'sibling',
	last: 'empty',
	sibling: 'sibling',
	empty: 'empty',
	icon: 'empty'
}

// ─── Reactive tree traversal utilities ─────────────────────────────────────────

/**
 * Compute the lineTypes array for a single node.
 * @param {string[]} parentLineTypes
 * @param {string} position - 'child' or 'last'
 * @param {boolean} isExpandable
 * @returns {string[]}
 */
function computeLineTypes(parentLineTypes, position, isExpandable) {
	const inherited = parentLineTypes.slice(0, -1).map((t) => NEXT_LINE[t] ?? 'empty')
	if (parentLineTypes.length > 0) inherited.push(position)
	return isExpandable ? [...inherited, 'icon'] : inherited
}

/**
 * Build flat view by walking proxy.children ($derived) recursively.
 * Reads proxy.expanded ($state) and proxy.children ($derived), so any
 * $derived wrapping this function re-computes on expansion or children changes.
 *
 * Computes lineTypes per node during the walk — no second pass needed.
 * lineTypes is an array of connector types for rendering tree lines:
 *   'child'   — branch connector
 *   'last'    — last branch connector
 *   'sibling' — vertical continuation line
 *   'empty'   — (blank space)
 *   'icon'    — expand/collapse toggle slot
 *
 * @param {ProxyItem[]} proxies
 * @param {string[]} [parentLineTypes]  Line types of the parent node (for computing inherited connectors)
 * @returns {{ key: string, proxy: ProxyItem, level: number, hasChildren: boolean, isExpandable: boolean, type: string, lineTypes: string[] }[]}
 */
/**
 * Visit a single proxy node and push entries to result.
 * @param {Array} result
 * @param {ProxyItem} proxy
 * @param {string[]} parentLineTypes
 * @param {string} position - 'child' or 'last'
 */
function visitProxy(result, proxy, parentLineTypes, position) {
	const children = proxy.children // reads $derived — registers dependency
	const hasChildren = children.length > 0
	const isExpandable = hasChildren || proxy.get('children') === true // sentinel: lazy-loadable
	const lineTypes = computeLineTypes(parentLineTypes, position, isExpandable)
	result.push({ key: proxy.key, proxy, level: proxy.level, hasChildren, isExpandable, type: proxy.type, lineTypes })
	if (hasChildren && proxy.expanded) {
		result.push(...buildReactiveFlatView(children, lineTypes))
	}
}

function buildReactiveFlatView(proxies, parentLineTypes = []) {
	const result = []
	for (let i = 0; i < proxies.length; i++) {
		visitProxy(result, proxies[i], parentLineTypes, i === proxies.length - 1 ? 'last' : 'child')
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
function buildReactiveLookup(proxies, map = new SvelteMap()) {
	for (const proxy of proxies) {
		map.set(proxy.key, proxy)
		const children = proxy.children
		if (children.length > 0) {
			buildReactiveLookup(children, map)
		}
	}
	return map
}

// ─── ProxyTree ─────────────────────────────────────────────────────────────────

export class ProxyTree {
	#fields
	#factory

	// Root proxies — $state so reassignment triggers $derived recomputation.
	#rootProxies = $state([])

	// Reactive flatView: re-derives when proxy.expanded OR proxy.children changes.
	flatView = $derived(buildReactiveFlatView(this.#rootProxies))

	// Reactive lookup: re-derives when proxy.children changes anywhere in the tree.
	#lookup = $derived(buildReactiveLookup(this.#rootProxies))

	/**
	 * @param {unknown[]} [items]
	 * @param {Partial<typeof BASE_FIELDS>} [fields]
	 * @param {{ createProxy?: (raw: *, fields: object, key: string, level: number) => ProxyItem }} [options]
	 */
	constructor(items = [], fields = {}, options = {}) {
		this.#fields = { ...BASE_FIELDS, ...(fields && typeof fields === 'object' ? fields : {}) }
		this.#factory = this.#resolveFactory(options.createProxy)
		this.#rootProxies = (items ?? []).map((raw, i) =>
			this.#factory(raw, this.#fields, String(i), 1)
		)
	}

	/**
	 * @param {Function|undefined} createProxy
	 * @returns {Function}
	 */
	#resolveFactory(createProxy) {
		return createProxy ?? ((raw, f, key, level) => new ProxyItem(raw, f, key, level))
	}

	// ─── Read accessors ──────────────────────────────────────────────────────

	/** @returns {ProxyItem[]} Root proxy array */
	get roots() {
		return this.#rootProxies
	}

	/** @returns {Map<string, ProxyItem>} Lookup map of all proxies by key */
	get lookup() {
		return this.#lookup
	}

	// ─── Mutation methods ────────────────────────────────────────────────────

	/**
	 * Append new root items. Creates proxies with keys continuing from
	 * the current length. Reassigns #rootProxies to trigger $derived.
	 *
	 * @param {unknown[]} items  Raw items to append as roots
	 */
	append(items) {
		const start = this.#rootProxies.length
		const newProxies = items.map((raw, i) => this.#factory(raw, this.#fields, String(start + i), 1))
		this.#rootProxies = [...this.#rootProxies, ...newProxies]
	}

	/**
	 * Add children to an existing proxy node.
	 * Uses proxy.set('children', rawItems) so ProxyItem's version counter
	 * triggers #buildChildren() recomputation. The flatView and lookup
	 * derive from proxy.children reactively.
	 *
	 * @param {ProxyItem} proxy  The proxy to add children to
	 * @param {unknown[]} items  Raw child items
	 */
	addChildren(proxy, items) {
		proxy.set('children', items)
	}
}

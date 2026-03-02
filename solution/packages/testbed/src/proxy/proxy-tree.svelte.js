/**
 * ProxyTree (testbed copy)
 *
 * Reactive data layer that manages a tree of ProxyItem instances.
 * Derives flatView (for rendering) and lookup (for O(1) access) reactively
 * from the root proxies and their children.
 *
 * Used by Wrapper as the shared data model.
 */

import { DEFAULT_FIELDS } from '../constants.js'
import { ProxyItem } from './proxy.svelte.js'

// ─── Reactive tree traversal utilities ─────────────────────────────────────────

/**
 * Build flat view by walking proxy.children recursively.
 * Reads proxy.expanded ($state) and proxy.children ($derived), so any
 * $derived wrapping this function re-computes on expansion or children changes.
 *
 * @param {ProxyItem[]} proxies
 * @returns {{ key: string, proxy: ProxyItem, level: number, hasChildren: boolean, type: string }[]}
 */
function buildReactiveFlatView(proxies) {
	const result = []
	for (const proxy of proxies) {
		const children = proxy.children // reads $derived — registers dependency
		const hasChildren = children.length > 0

		result.push({
			key: proxy.key,
			proxy,
			level: proxy.level,
			hasChildren,
			type: proxy.type
		})
		if (hasChildren && proxy.expanded) {
			result.push(...buildReactiveFlatView(children))
		}
	}
	return result
}

/**
 * Build lookup Map by walking proxy.children recursively.
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

// ─── ProxyTree ─────────────────────────────────────────────────────────────────

export class ProxyTree {
	#fields

	// Root proxies — $state so reassignment triggers $derived recomputation.
	#rootProxies = $state([])

	// Reactive flatView: re-derives when proxy.expanded OR proxy.children changes.
	flatView = $derived(buildReactiveFlatView(this.#rootProxies))

	// Reactive lookup: re-derives when proxy.children changes anywhere in the tree.
	#lookup = $derived(buildReactiveLookup(this.#rootProxies))

	/**
	 * @param {unknown[]} [items]
	 * @param {Partial<typeof DEFAULT_FIELDS>} [fields]
	 */
	constructor(items = [], fields = {}) {
		this.#fields = { ...DEFAULT_FIELDS, ...fields }
		this.#rootProxies = (items ?? []).map((raw, i) => new ProxyItem(raw, this.#fields, String(i), 1))
	}

	// ─── Read accessors ──────────────────────────────────────────────────────

	/** @returns {ProxyItem[]} Root proxy array */
	get roots() { return this.#rootProxies }

	/** @returns {Map<string, ProxyItem>} Lookup map of all proxies by key */
	get lookup() { return this.#lookup }
}

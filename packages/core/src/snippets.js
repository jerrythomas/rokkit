/** Snippet lookup for data-driven rendering. */
import { has } from 'ramda'
import { ITEM_SNIPPET } from './constants'

/**
 * Get snippet function from an object
 * @param {Object} obj
 * @param {string} key
 * @param {null|Function} defaultSnippet
 * @returns {Function|undefined}
 */
export function getSnippet(obj, key, defaultSnippet = null) {
	if (has(key, obj) && typeof obj[key] === 'function') {
		return obj[key]
	}
	return defaultSnippet
}

/**
 * @param {unknown} value
 * @returns {Function|null}
 */
function asSnippet(value) {
	return typeof value === 'function' ? value : null
}

/**
 * Resolve which snippet to render for a proxy item.
 *
 * Reads the proxy's `snippet` field (via proxy.get('snippet'), honoring fields.snippet)
 * for a per-item named override first (e.g. item.snippet = 'highlighted').
 * Falls back to the component-level fallback snippet name (e.g. 'itemContent' / 'groupContent').
 * Returns null if neither is found.
 *
 * @param {Record<string, unknown>} snippets  - snippets passed to the component
 * @param {{ get: (key: string) => unknown }} proxy  - a ProxyItem; its snippet field is read via proxy.get('snippet')
 * @param {string} [fallback]                  - fallback snippet name; defaults to ITEM_SNIPPET ('itemContent')
 * @returns {Function | null}
 */
export function resolveSnippet(snippets, proxy, fallback = ITEM_SNIPPET) {
	// `snippet` is a field-mapped prop like icon/href — read it via the proxy's
	// field accessor (honors fields.snippet), not as a direct property.
	const name = proxy?.get('snippet')
	return asSnippet(name && snippets[name]) || asSnippet(snippets[fallback])
}

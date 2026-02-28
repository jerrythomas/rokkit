/**
 * Snippet resolution utilities
 *
 * Shared across all components that support content snippet customization.
 */

/**
 * Resolve the content snippet for a proxy item.
 *
 * Resolution order:
 *   1. proxy.snippet name → named snippet in the snippets map (per-item override)
 *   2. fallback name      → component-level override (e.g. 'itemContent', 'groupContent')
 *   3. null               → caller renders its built-in default
 *
 * @param {Record<string, unknown>} snippets  Rest props from the component
 * @param {import('./proxy/proxy.svelte.js').ProxyItem} proxy
 * @param {string} fallback  Name of the component-level fallback snippet
 * @returns {import('svelte').Snippet | null}
 */
export function resolveSnippet(snippets, proxy, fallback) {
	const name = proxy.snippet
	if (name && snippets[name]) return /** @type {import('svelte').Snippet} */ (snippets[name])
	return /** @type {import('svelte').Snippet | null} */ (snippets[fallback] ?? null)
}

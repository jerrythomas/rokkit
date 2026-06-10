/**
 * Apply named-token CSS custom properties to an element as inline styles.
 * A per-instance / runtime color applicator — complementary to the `data-skin`
 * cascade (use `vibe.skin` + `themable` for app-wide named skins; use this to
 * apply a colorset that isn't pre-baked, e.g. a dynamic or server-configured skin).
 *
 * @param {HTMLElement} node
 * @param {Record<string, string>} variables - CSS var name → value, e.g. { '--primary': 'oklch(...)' }
 */
export function skinnable(node, variables) {
	$effect(() => {
		Object.entries(variables).forEach(([key, value]) => {
			node.style.setProperty(key, value)
		})
	})
}

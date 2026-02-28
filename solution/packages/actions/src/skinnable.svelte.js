/**
 * Applies theme variables to an element
 * @param {HTMLElement} node - Element to apply variables to
 * @param {Object.<string, string>} variables - CSS variables and their values
 */
export function skinnable(node, variables) {
	$effect(() => {
		Object.entries(variables).forEach(([key, value]) => {
			node.style.setProperty(key, value)
		})
	})
}

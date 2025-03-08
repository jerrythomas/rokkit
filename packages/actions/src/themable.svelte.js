const DEFAULT_THEME = { style: 'rokkit', mode: 'dark', density: 'comfortable' }

/**
 * Update the theme attributes when the state changes.
 *
 * @param {HTMLElement} root
 * @param {import('./types.js').ThemableConfig} options - Custom key mappings
 */
export function themable(root, options) {
	const { theme = DEFAULT_THEME } = options ?? {}

	$effect(() => {
		root.dataset.style = theme.style
		root.dataset.mode = theme.mode
		root.dataset.density = theme.density
	})
}

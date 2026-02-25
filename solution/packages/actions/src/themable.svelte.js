const DEFAULT_THEME = { style: 'rokkit', mode: 'dark', density: 'comfortable' }

/**
 * Update the theme attributes when the state changes.
 *
 * @param {HTMLElement} root
 * @param {import('./types.js').ThemableConfig} options - Custom key mappings
 */
export function themable(root, options) {
	const { theme = DEFAULT_THEME, storageKey } = options ?? {}

	if (storageKey) {
		// Initial load from storage
		theme.load(storageKey)

		// Save changes to storage
		$effect(() => {
			theme.save(storageKey)
		})

		// Handle storage events
		const handleStorage = (event) => {
			if (event.key === storageKey && event.newValue !== null) {
				try {
					const newTheme = JSON.parse(event.newValue)
					theme.update(newTheme)
				} catch (e) {
					// eslint-disable-next-line no-console
					console.warn(`Failed to parse theme from storage event for key "${storageKey}"`, e)
				}
			}
		}
		// Set up storage event listener
		$effect.root(() => {
			window.addEventListener('storage', handleStorage)
			return () => window.removeEventListener('storage', handleStorage)
		})
	}
	$effect(() => {
		root.dataset.style = theme.style
		root.dataset.mode = theme.mode
		root.dataset.density = theme.density

		// if (storageKey) theme.save(storageKey)
	})
}

const DEFAULT_THEME = { style: 'rokkit', mode: 'dark', density: 'comfortable', skin: 'default' }

/** The four data-attributes that together select a theme. */
const THEME_ATTRS = ['style', 'mode', 'density', 'skin']

/**
 * Write the theme's attributes onto one element's dataset.
 *
 * @param {HTMLElement} el
 * @param {Record<string, string>} theme
 */
function applyThemeAttrs(el, theme) {
	for (const attr of THEME_ATTRS) el.dataset[attr] = theme[attr]
}

/**
 * Persist the theme to storage, and adopt changes another document writes to the
 * same key — that second half is what keeps two open tabs in agreement.
 *
 * @param {import('./types.js').Themable} theme
 * @param {string} storageKey
 */
function syncWithStorage(theme, storageKey) {
	theme.load(storageKey)

	$effect(() => {
		theme.save(storageKey)
	})

	const handleStorage = (event) => {
		if (event.key !== storageKey || event.newValue === null) return
		try {
			theme.update(JSON.parse(event.newValue))
		} catch (e) {
			// eslint-disable-next-line no-console
			console.warn('Failed to parse theme from storage event for key "%s"', storageKey, e)
		}
	}

	$effect.root(() => {
		window.addEventListener('storage', handleStorage)
		return () => window.removeEventListener('storage', handleStorage)
	})
}

/**
 * Update the theme attributes when the state changes.
 *
 * @param {HTMLElement} root
 * @param {import('./types.js').ThemableConfig} options - Custom key mappings
 */
export function themable(root, options) {
	const { theme = DEFAULT_THEME, storageKey } = options ?? {}

	if (storageKey) syncWithStorage(theme, storageKey)

	$effect(() => {
		applyThemeAttrs(root, theme)

		// Mirror onto documentElement too. The flash-prevention init script
		// sets `html.dataset.*` before body parses; without this mirror,
		// runtime mode/style changes write to `body` only and the html
		// element retains its initial values. CSS rules using bare
		// `[data-mode='dark']` (no element prefix) match via ancestors,
		// so both the old html value and the new body value would apply,
		// causing the partial / no-op style change users see when toggling.
		if (typeof document !== 'undefined' && root !== document.documentElement) {
			applyThemeAttrs(document.documentElement, theme)
		}
	})
}

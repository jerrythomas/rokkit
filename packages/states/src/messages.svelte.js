/**
 * Default (English) messages for all UI components.
 * @type {import('./types').Messages}
 */
const defaultMessages = {
	emptyList: 'No items found',
	emptyTree: 'No data available',
	loading: 'Loading...',
	noResults: 'No results found',
	select: 'Select an option',
	search: 'Search...',
	list: { label: 'List' },
	tree: {
		label: 'Tree',
		expand: 'Expand',
		collapse: 'Collapse',
		loading: 'Loading',
		loadMore: 'Load More'
	},
	toolbar: { label: 'Toolbar' },
	menu: { label: 'Menu' },
	toggle: { label: 'Selection' },
	rating: { label: 'Rating' },
	stepper: { label: 'Progress' },
	breadcrumbs: { label: 'Breadcrumb' },
	carousel: {
		label: 'Carousel',
		prev: 'Previous slide',
		next: 'Next slide',
		slides: 'Slide navigation'
	},
	tabs: { add: 'Add tab', remove: 'Remove tab', placeholder: 'Select a tab to view its content.' },
	table: { empty: 'No data', sortAscending: 'Sort ascending', sortDescending: 'Sort descending' },
	code: { copy: 'Copy code', copied: 'Copied!' },
	range: { lower: 'Lower bound', upper: 'Upper bound', value: 'Value' },
	search_: { clear: 'Clear search' },
	filter: { remove: 'Remove filter' },
	grid: { label: 'Grid' },
	uploadProgress: {
		label: 'Upload progress',
		clear: 'Clear all',
		cancel: 'Cancel',
		retry: 'Retry',
		remove: 'Remove'
	},
	floatingNav: { label: 'Page navigation', pin: 'Pin navigation', unpin: 'Unpin navigation' },
	mode: { system: 'System', light: 'Light', dark: 'Dark' }
}

/**
 * Deep-merge `overrides` onto `base`. One level deep for nested objects.
 * @param {Record<string, unknown>} base
 * @param {Record<string, unknown>} overrides
 * @returns {Record<string, unknown>}
 */
function deepMerge(base, overrides) {
	const result = { ...base }
	for (const key of Object.keys(overrides)) {
		const isObj = (v) => typeof v === 'object' && v !== null
		result[key] =
			isObj(overrides[key]) && isObj(result[key])
				? { ...result[key], ...overrides[key] }
				: overrides[key]
	}
	return result
}

/**
 * Locale-aware messages store.
 *
 * Usage:
 *   messages.register('de', { select: 'Option wählen…', table: { empty: 'Keine Daten' } })
 *   messages.setLocale('de')   // activates 'de', falls back to 'en' for missing keys
 *   messages.setLocale('en')   // back to defaults
 *   messages.current           // reactive — re-renders on locale change
 */
class MessagesStore {
	/** @type {Record<string, Partial<import('./types').Messages>>} */
	#registry = $state({})

	/** @type {string} */
	#locale = $state('en')

	/** @type {import('./types').Messages} */
	#messages = $derived.by(() => {
		const overrides = this.#registry[this.#locale]
		if (!overrides) return structuredClone(defaultMessages)
		return /** @type {import('./types').Messages} */ (deepMerge(defaultMessages, overrides))
	})

	/**
	 * The active message set — reactive.
	 * @returns {import('./types').Messages}
	 */
	get current() {
		return this.#messages
	}

	/**
	 * The active locale tag.
	 * @returns {string}
	 */
	get locale() {
		return this.#locale
	}

	/**
	 * Register overrides for a locale. Missing keys fall back to English defaults.
	 * @param {string} locale — BCP 47 tag or any identifier (e.g. 'de', 'fr-CA')
	 * @param {Partial<import('./types').Messages>} overrides
	 */
	register(locale, overrides) {
		this.#registry = { ...this.#registry, [locale]: overrides }
	}

	/**
	 * Switch the active locale. Must have been registered first (or 'en' for defaults).
	 * @param {string} locale
	 */
	setLocale(locale) {
		this.#locale = locale
	}

	/**
	 * Apply one-off overrides without naming a locale (convenience / backward compat).
	 * Equivalent to register('_custom', overrides) + setLocale('_custom').
	 * @param {Partial<import('./types').Messages>} overrides
	 */
	set(overrides) {
		this.register('_custom', overrides)
		this.setLocale('_custom')
	}

	/**
	 * Reset to English defaults and clear the locale registry.
	 */
	reset() {
		this.#registry = {}
		this.#locale = 'en'
	}
}

export const messages = new MessagesStore()

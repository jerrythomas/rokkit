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

class MessagesStore {
	#registry = {}
	#locale = 'en'

	// ─── Flat string keys ─────────────────────────────────────────────────────

	emptyList = $state(defaultMessages.emptyList)
	emptyTree = $state(defaultMessages.emptyTree)
	loading = $state(defaultMessages.loading)
	noResults = $state(defaultMessages.noResults)
	select = $state(defaultMessages.select)
	search = $state(defaultMessages.search)

	// ─── Nested component namespaces ──────────────────────────────────────────

	list = $state({ ...defaultMessages.list })
	tree = $state({ ...defaultMessages.tree })
	toolbar = $state({ ...defaultMessages.toolbar })
	menu = $state({ ...defaultMessages.menu })
	toggle = $state({ ...defaultMessages.toggle })
	rating = $state({ ...defaultMessages.rating })
	stepper = $state({ ...defaultMessages.stepper })
	breadcrumbs = $state({ ...defaultMessages.breadcrumbs })
	carousel = $state({ ...defaultMessages.carousel })
	tabs = $state({ ...defaultMessages.tabs })
	table = $state({ ...defaultMessages.table })
	code = $state({ ...defaultMessages.code })
	range = $state({ ...defaultMessages.range })
	search_ = $state({ ...defaultMessages.search_ })
	filter = $state({ ...defaultMessages.filter })
	grid = $state({ ...defaultMessages.grid })
	uploadProgress = $state({ ...defaultMessages.uploadProgress })
	floatingNav = $state({ ...defaultMessages.floatingNav })
	mode = $state({ ...defaultMessages.mode })

	// ─── Active locale ─────────────────────────────────────────────────────────

	/** Currently active locale tag (read-only). */
	get locale() {
		return this.#locale
	}

	// ─── Internals ─────────────────────────────────────────────────────────────

	#apply() {
		const overrides = this.#registry[this.#locale]
		const computed = overrides
			? /** @type {import('./types').Messages} */ (deepMerge(defaultMessages, overrides))
			: structuredClone(defaultMessages)
		Object.assign(this, computed)
	}

	// ─── Public API ────────────────────────────────────────────────────────────

	/**
	 * Register translation overrides for a locale. Unspecified keys fall back to English defaults.
	 * @param {string} locale — BCP 47 tag or any identifier (e.g. 'de', 'fr-CA')
	 * @param {Partial<import('./types').Messages>} overrides
	 */
	register(locale, overrides) {
		this.#registry = { ...this.#registry, [locale]: overrides }
		this.#apply()
	}

	/**
	 * Switch to a previously registered locale. Use 'en' to restore English defaults.
	 * @param {string} locale
	 */
	setLocale(locale) {
		this.#locale = locale
		this.#apply()
	}

	/**
	 * Apply one-off overrides without naming a locale (convenience / backward compat).
	 * @param {Partial<import('./types').Messages>} overrides
	 */
	set(overrides) {
		this.#registry = { ...this.#registry, _custom: overrides }
		this.#locale = '_custom'
		this.#apply()
	}

	/**
	 * Reset to English defaults and clear all registered locales.
	 */
	reset() {
		this.#registry = {}
		this.#locale = 'en'
		this.#apply()
	}
}

/**
 * Reactive messages store. Access strings directly: `messages.select`, `messages.tree.expand`.
 * Configure locale: `messages.register('de', {...})` + `messages.setLocale('de')`.
 */
export const messages = new MessagesStore()

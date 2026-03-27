/**
 * Default messages for UI components
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
 * Messages store for localized UI strings
 */
class MessagesStore {
	/** @type {import('./types').Messages} */
	#messages = $state({ ...defaultMessages })

	/**
	 * Get the current messages
	 * @returns {import('./types').Messages}
	 */
	get current() {
		return this.#messages
	}

	/**
	 * Merge a single key from custom into merged target.
	 * @param {Record<string, unknown>} merged
	 * @param {Record<string, unknown>} custom
	 * @param {string} key
	 */
	#mergeKey(merged, custom, key) {
		const isObject = (v) => typeof v === 'object' && v !== null
		if (isObject(custom[key]) && isObject(merged[key])) {
			merged[key] = { ...merged[key], ...custom[key] }
		} else {
			merged[key] = custom[key]
		}
	}

	/**
	 * Set custom messages (merges with defaults)
	 * @param {Partial<import('./types').Messages>} custom
	 */
	set(custom) {
		const merged = { ...defaultMessages }
		for (const key of Object.keys(custom)) {
			this.#mergeKey(merged, custom, key)
		}
		this.#messages = merged
	}

	/**
	 * Reset to default messages
	 */
	reset() {
		this.#messages = { ...defaultMessages }
	}
}

export const messages = new MessagesStore()

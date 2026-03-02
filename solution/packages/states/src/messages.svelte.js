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
	tree: { label: 'Tree', expand: 'Expand', collapse: 'Collapse', loading: 'Loading', loadMore: 'Load More' },
	toolbar: { label: 'Toolbar' },
	menu: { label: 'Menu' },
	toggle: { label: 'Selection' },
	rating: { label: 'Rating' },
	stepper: { label: 'Progress' },
	breadcrumbs: { label: 'Breadcrumb' },
	carousel: { label: 'Carousel', prev: 'Previous slide', next: 'Next slide', slides: 'Slide navigation' },
	tabs: { add: 'Add tab', remove: 'Remove tab' },
	code: { copy: 'Copy code', copied: 'Copied!' },
	range: { lower: 'Lower bound', upper: 'Upper bound', value: 'Value' },
	search_: { clear: 'Clear search' },
	filter: { remove: 'Remove filter' },
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
	 * Set custom messages (merges with defaults)
	 * @param {Partial<import('./types').Messages>} custom
	 */
	set(custom) {
		const merged = { ...defaultMessages }
		for (const key of Object.keys(custom)) {
			if (typeof custom[key] === 'object' && custom[key] !== null && typeof merged[key] === 'object' && merged[key] !== null) {
				merged[key] = { ...merged[key], ...custom[key] }
			} else {
				merged[key] = custom[key]
			}
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

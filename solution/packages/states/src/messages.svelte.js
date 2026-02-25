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
	search: 'Search...'
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
		this.#messages = { ...defaultMessages, ...custom }
	}

	/**
	 * Reset to default messages
	 */
	reset() {
		this.#messages = { ...defaultMessages }
	}
}

export const messages = new MessagesStore()

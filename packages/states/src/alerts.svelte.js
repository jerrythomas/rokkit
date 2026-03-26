class AlertsStore {
	/** @type {Array<{id: string, type: string, text?: string, dismissible: boolean, timeout: number, actions?: unknown}>} */
	#items = $state([])
	/** @type {Map<string, ReturnType<typeof setTimeout>>} */
	#timers = new Map()

	get current() {
		return this.#items
	}

	/**
	 * Push a new alert. Returns the alert id.
	 * @param {{ type?: string, text?: string, dismissible?: boolean, timeout?: number, actions?: unknown }} alert
	 * @returns {string}
	 */
	#scheduleTimer(id, timeout) {
		if (timeout > 0) {
			this.#timers.set(id, setTimeout(() => this.dismiss(id), timeout))
		}
	}

	// eslint-disable-next-line complexity
	push({ type = 'info', text, dismissible = false, timeout = dismissible ? 0 : 4000, actions } = {}) {
		const id = crypto.randomUUID()
		this.#items = [...this.#items, { id, type, text, dismissible, timeout, actions }]
		this.#scheduleTimer(id, timeout)
		return id
	}

	/**
	 * Dismiss an alert by id, cancelling its timer if any.
	 * @param {string} id
	 */
	dismiss(id) {
		clearTimeout(this.#timers.get(id))
		this.#timers.delete(id)
		this.#items = this.#items.filter((a) => a.id !== id)
	}

	/**
	 * Clear all alerts and cancel all timers.
	 */
	clear() {
		for (const timer of this.#timers.values()) clearTimeout(timer)
		this.#timers.clear()
		this.#items = []
	}
}

export const alerts = new AlertsStore()

import { equals } from 'ramda'

/**
 * @template T
 * @typedef {Object} StorageOptions
 * @property {string} key - Storage key
 * @property {T} defaultValue - Default value
 * @property {(stored: unknown) => T} [migrate] - Optional migration function for stored data
 */

/**
 * Class to handle persistent storage with events
 * @template T
 */
export class Storage {
	/** @type {string} */
	#key
	/** @type {T} */
	#value
	/** @type {(event: StorageEvent) => void} */
	#handleStorage

	/**
	 * @param {StorageOptions<T>} options
	 */
	constructor({ key, defaultValue, migrate }) {
		this.#key = key
		this.#value = defaultValue

		try {
			const stored = localStorage.getItem(key)
			if (stored) {
				const parsed = JSON.parse(stored)
				this.#value = migrate ? migrate(parsed) : parsed
			}
		} catch (e) {
			// eslint-disable-next-line no-console
			console.warn(`Failed to load value from storage for key "${key}"`, e)
		}

		this.#handleStorage = (event) => {
			if (event.key === this.#key && event.newValue !== null) {
				try {
					this.#value = JSON.parse(event.newValue)
				} catch (e) {
					// eslint-disable-next-line no-console
					console.warn(`Failed to parse storage value for key "${key}"`, e)
				}
			}
		}

		window.addEventListener('storage', this.#handleStorage)
	}

	/**
	 * Get current value
	 * @returns {T}
	 */
	get value() {
		return this.#value
	}

	/**
	 * Set new value and persist to storage
	 * @param {T} newValue
	 */
	set value(newValue) {
		if (equals(newValue, this.#value)) return
		this.#value = newValue
		try {
			localStorage.setItem(this.#key, JSON.stringify(newValue))
		} catch (e) {
			// eslint-disable-next-line no-console
			console.warn(`Failed to save value to storage for key "${this.#key}"`, e)
		}
	}

	/**
	 * Update partial value
	 * @param {Partial<T>} partial
	 */
	update(partial) {
		this.value = { ...this.value, ...partial }
	}

	/**
	 * Cleanup storage listeners
	 */
	destroy() {
		window.removeEventListener('storage', this.#handleStorage)
	}
}

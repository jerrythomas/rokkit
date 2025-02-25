import { find, toPairs } from 'ramda'

/**
 * Class to manage key event mappings.
 */
export class KeyEventMap {
	constructor() {
		this.mapping = {}
	}

	/**
	 * Add a new key mapping.
	 * @param {string}               eventName - The event name.
	 * @param {Array<string>|RegExp} keys      - The keys to match.
	 */
	add(eventName, keys) {
		if (!Array.isArray(keys) && !(keys instanceof RegExp)) {
			throw new Error('Keys must be an array or a regular expression')
		}
		this.mapping[eventName] = keys
	}

	/**
	 * Get the event name for a given key.
	 * @param {string} key - The key to match.
	 * @returns {string|null} - The event name or null if no match is found.
	 */
	getEventForKey(key) {
		// eslint-disable-next-line no-unused-vars
		const matchEvent = ([_, keys]) =>
			(Array.isArray(keys) && keys.includes(key)) || (keys instanceof RegExp && keys.test(key))

		const event = find(matchEvent, toPairs(this.mapping))
		return event ? event[0] : null
	}
}

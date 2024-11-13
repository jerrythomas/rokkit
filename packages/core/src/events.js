import { noop } from './utils'

/**
 * Creates an emitter object from the given properties.
 * Filters out attributes that start with 'on' and are functions,
 * and returns an object with keys that do not start with 'on' and the values are the same functions.
 * If a default event is not present in the props, it will be set to a no-op function.
 *
 * @param {Object} props - The properties object to filter.
 * @param {Array<string>} defaults - An array of default events.
 * @returns {Object} The emitter object.
 */
export function createEmitter(props, defaults = []) {
	const emit = {}

	// Filter and add functions that start with 'on'
	Object.entries(props)
		.filter(([key, value]) => key.startsWith('on') && typeof value === 'function')
		.forEach(([key, value]) => {
			emit[key.slice(2)] = value
		})

	// Add default events with no-op function if not present
	defaults.forEach((event) => {
		if (!emit[event]) {
			emit[event] = noop
		}
	})

	return emit
}

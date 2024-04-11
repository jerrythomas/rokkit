/**
 * Generates a random id
 *
 * @returns {string} A random id
 */
export function id() {
	return Math.random().toString(36).substring(2, 9)
}

/**
 * Check if a value is a json object
 *
 * @param {*} val
 * @returns {boolean}
 */
export function isObject(val) {
	return typeof val === 'object' && val !== null && !(val instanceof Date)
}

/**
 * Converts the value to a string. If the value is an object, it will convert it to a JSON string.
 *
 * @param {*} value
 * @returns {string}
 */
export function toString(value) {
	if (value === null || value === undefined) return value
	if (isObject(value)) return JSON.stringify(value, null, 2)
	return value.toString()
}

/**
 * Generates icon shortcuts for a collection of icons
 *
 * @param {string[]} icons
 * @param {string} collection
 * @param {string} variants
 * @returns {Object}
 */
export function iconShortcuts(icons, collection, variants) {
	const suffix = variants ? `-${variants}` : ''
	const shortcuts = !collection
		? {}
		: icons.reduce(
				(acc, name) => ({
					...acc,
					[name]: [collection, name].join(':') + suffix
				}),
				{}
			)

	return shortcuts
}

/**
 * Scales the path by the size
 *
 * @param {number} size
 * @param {string|number} x
 * @returns {string|number}
 */
export function scaledPath(size, x) {
	if (Array.isArray(x)) return x.map((v) => scaledPath(size, v)).join(' ')
	return typeof x === 'number' ? x * size : x
}

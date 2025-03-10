/**
 * Finds the closest ancestor of the given element that has the given attribute.
 *
 * @param {HTMLElement} element
 * @param {string} attribute
 * @returns {HTMLElement|null}
 */
export function getClosestAncestorWithAttribute(element, attribute) {
	if (!element) return null
	if (element.getAttribute(attribute)) return element
	return getClosestAncestorWithAttribute(element.parentElement, attribute)
}

/**
 * A function that performs no operations.
 */
export function noop() {
	// intentionally empty to support default actions
}

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

/**
 * Gets a key string from path
 * @param {string[]} path
 * @returns {string}
 */
export function getKeyFromPath(path) {
	return path.join('-')
}

/**
 * Gets a path array from key string
 * @param {string} key
 * @returns {string[]}
 */
export function getPathFromKey(key) {
	return key.split('-').map(Number)
}

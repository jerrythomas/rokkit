import { has, isNil } from 'ramda'
import { URL } from 'url'
import { DATA_IMAGE_REGEX } from './constrants'

let idCounter = 0
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
export function id(prefix = '') {
	return [prefix, Math.random().toString(36).substring(2, 9), ++idCounter]
		.filter((x) => !isNil(x) && x !== '')
		.join('-')
}

/**
 * Check if a value is a json object
 *
 * @param {*} val
 * @returns {boolean}
 */
export function isObject(val) {
	return typeof val === 'object' && !isNil(val) && !(val instanceof Date)
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
	return Array.isArray(path) ? path.join('-') : [path].join('-')
}

/**
 * Gets a path array from key string
 * @param {string} key
 * @returns {string[]}
 */
export function getPathFromKey(key) {
	return key.split('-').map(Number)
}

/**
 * Get snippet function from an object
 * @param {Object} obj
 * @param {string} key
 * @param {null|Function} defaultSnippet
 * @returns {Function|undefined}
 */
export function getSnippet(obj, key, defaultSnippet = null) {
	if (has(key, obj) && typeof obj[key] === 'function') {
		return obj[key]
	}
	return defaultSnippet
}

/**
 * Creates a collection of icon import functions based on an icons dictionary
 *
 * @param {Object} icons - Dictionary mapping collection names to file paths
 * @returns {Object} Collections object with functions that dynamically import icon files
 */
export const importIcons = (icons) => {
	if (!icons) return {}

	return Object.entries(icons).reduce((acc, [key, value]) => {
		acc[key] = () =>
			import(/* @vite-ignore */ value, { with: { type: 'json' } }).then((i) => i.default)
		return acc
	}, {})
}

/**
 * convert hex string to `{r} {g} {b}`
 * @param {string} hex
 * @return {string}
 */
export function hex2rgb(hex) {
	const [r, g, b] = hex.match(/\w\w/g).map((x) => parseInt(x, 16))
	return `${r} ${g} ${b}`
}

/**
 * Checks if a string is a valid image URL
 *
 * @param {string} str - The string to check
 * @returns {boolean} - Returns true if the string is an image URL
 */
function isImageUrl(str) {
	// Check if the string is a URL
	try {
		const url = new URL(str)

		// Check common image extensions
		const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg', '.tiff']
		const path = url.pathname.toLowerCase()

		if (imageExtensions.some((ext) => path.endsWith(ext))) {
			return true
		}

		return false
		// eslint-disable-next-line no-unused-vars
	} catch (e) {
		// Not a valid URL
		return false
	}
}
/**
 * A utility function that detects if a string is an image URL or image data (base64)
 *
 * @param {string} str - The string to check
 * @returns {string|null} - Returns the original string if it's an image URL or image data, otherwise null
 */
export function getImage(str) {
	if (DATA_IMAGE_REGEX.test(str)) return str
	// Check if it's a URL

	if (isImageUrl(str)) return str

	return null
}

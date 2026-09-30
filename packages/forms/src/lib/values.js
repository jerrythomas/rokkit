/**
 * Pure helpers over plain form values — primitives, plain objects and arrays, addressed by
 * slash paths (`'settings/distance'`).
 */

/**
 * Deep-clone a plain value. A JSON round-trip, which also unwraps `$state` proxies safely.
 * @param {any} value
 * @returns {any}
 */
export function deepClone(value) {
	if (value === null || value === undefined || typeof value !== 'object') return value
	return JSON.parse(JSON.stringify(value))
}

const isNullish = (v) => v === null || v === undefined

/** Same-shaped containers: both objects, and both arrays or both not. */
const sameContainer = (a, b) =>
	typeof a === 'object' && typeof b === 'object' && Array.isArray(a) === Array.isArray(b)

function equalArrays(a, b) {
	return a.length === b.length && a.every((v, i) => deepEqual(v, b[i]))
}

function equalObjects(a, b) {
	const keys = Object.keys(a)
	return (
		keys.length === Object.keys(b).length &&
		keys.every((k) => Object.hasOwn(b, k) && deepEqual(a[k], b[k]))
	)
}

/**
 * Structural equality for plain values. Nullish equals only itself; an array never equals an
 * object.
 * @param {any} a
 * @param {any} b
 * @returns {boolean}
 */
export function deepEqual(a, b) {
	if (a === b) return true
	if (isNullish(a) || isNullish(b) || !sameContainer(a, b)) return false
	return Array.isArray(a) ? equalArrays(a, b) : equalObjects(a, b)
}

/**
 * The value at a slash path, or undefined — also when the path runs through a non-object.
 * @param {any} data
 * @param {string} path
 */
export function getPath(data, path) {
	if (!path) return undefined
	let current = data
	for (const key of path.split('/')) {
		if (!current || typeof current !== 'object') return undefined
		current = current[key]
	}
	return current
}

/**
 * A copy of `data` with `value` at the slash path — every object along the path is copied, so
 * the original is untouched and reactive readers see a new root.
 * @param {Record<string, any>} data
 * @param {string} path
 * @param {any} value
 */
export function setPath(data, path, value) {
	const keys = path.split('/')
	const root = { ...data }
	let current = root
	for (const key of keys.slice(0, -1)) {
		current[key] = { ...current[key] }
		current = current[key]
	}
	current[keys[keys.length - 1]] = value
	return root
}

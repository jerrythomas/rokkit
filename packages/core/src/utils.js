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

export function scaledPath(size, x) {
	if (Array.isArray(x)) return x.map((x) => scaledPath(size, x)).join(' ')
	return typeof x === 'number' ? x * size : x
}

/** Item keys ↔ index paths (`[0, 2]` ↔ `'0-2'`). */

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

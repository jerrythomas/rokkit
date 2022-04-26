/**
 *
 * @typedef AesMapping
 * @field {string} x
 * @field {string} y
 * @field {string} fill
 * @field {string} color
 * @field {string} pattern
 * @field {object} animate
 */
/**
 *
 * @param {AesMapping} fields
 * @returns
 */
export function aes(fields) {
	let mapping = {
		x: undefined,
		y: undefined,
		fill: undefined,
		color: undefined,
		pattern: undefined,
		animate: undefined,
		...fields
	}
	return mapping
}

import { pick } from 'ramda'
import { compact } from './utils'

export const AestheticKeys = ['x', 'y', 'fill', 'color', 'timelapse']
/**
 *
 * @typedef Aesthetics
 * @property {string} x
 * @property {string} y
 * @property {string} fill
 * @property {string} color
 * @property {string} timelapse
 */
/**
 *
 * @param {Aesthetics} fields
 * @returns
 */
export function aes(fields) {
	return compact(pick(allowedKeys, fields))
}

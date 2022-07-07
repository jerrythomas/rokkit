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
	return compact(pick(AestheticKeys, fields))
}

/*

class structure

chart
  - data
	- aes
	  - x
		- y
		- fill
		- color
		- size (for scatter plots)
		- stat (stat used for plotting)
	- axis
	  - ticks
		- grid
		- tick labels
		- label
		- offset
		- tick size + space between tick & label
	- plot
	  - value labels
	- props
	  - range
		- scale
		- domain
		- origin
		- margin
		- padding
	- legend
	- title



*/

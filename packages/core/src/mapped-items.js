import { equals, isNil } from 'ramda'

/**
 * Get an item at a specific index
 * @param {Array<any>} items
 * @param {any} index
 * @returns
 */
export function getItemAtIndex(items, index) {
	if (isNil(index)) return null
	return index >= 0 && index < items.length ? items[index] : null
}

/**
 *  Get the index for an item in an array
 * @param {Array<any} items
 * @param {any} item
 * @returns
 */
export function getIndexForItem(items, item) {
	return items.findIndex((i) => equals(i, item))
}

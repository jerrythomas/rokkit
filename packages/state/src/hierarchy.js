/**
 * Converts a hierarchy of items into a flat array of objects.
 *ß
 * @param {Array<any>}                         items - The array of items to convert.
 * @param {import('@rokkit/core').FieldMapper} mapping - The field mapper to use for mapping.
 * @param {Array<number>}                      path - The current path of the item.
 * @returns {Array<Object>} - The flat array of objects.
 */
export function flatHierarchy(items, mapping, path = []) {
	const data = []
	items.forEach((item, index) => {
		const props = {
			depth: path.length,
			path: [...path, index],
			item,
			selected: false
		}

		const children = flatHierarchy(mapping.getChildren(item), mapping, [...path, index])
		data.push(props, ...children)
	})
	return data
}

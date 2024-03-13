const nextType = {
	child: 'sibling',
	last: 'empty',
	sibling: 'sibling',
	empty: 'empty'
}

/**
 * Constructs an array of line types based on the provided parameters.
 *
 * @param {boolean} hasChildren - Indicates whether the current item has children, affecting the line type for the item itself.
 * @param {Array<string>} parentTypes - An array of types from the parent indicating the line type context.
 * @param {string} position - The line type to use for the current position (usually 'child' or 'last').
 * @returns {Array<string>} An array of line types.
 */
export function getLineTypes(hasChildren = false, parentTypes = [], position = 'child') {
	// Map each parent type to a line type, except for the last element.
	const types = parentTypes.slice(0, -1).map((type) => nextType[type])

	// Append the position type for the last parent, if any.
	if (parentTypes.length > 0) {
		types.push(position)
	}

	// Append the line type based on whether the current item has children.
	types.push(hasChildren ? 'icon' : 'empty')

	return types
}

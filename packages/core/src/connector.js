const LINE_TYPES = {
	CHILD: 'child',
	LAST: 'last',
	SIBLING: 'sibling',
	EMPTY: 'empty',
	ICON: 'icon'
}

const nextType = {
	[LINE_TYPES.CHILD]: LINE_TYPES.SIBLING,
	[LINE_TYPES.LAST]: LINE_TYPES.EMPTY,
	[LINE_TYPES.SIBLING]: LINE_TYPES.SIBLING,
	[LINE_TYPES.EMPTY]: LINE_TYPES.EMPTY
}

/**
 * Constructs an array of line types for tree visualization
 * @param {boolean} hasChildren - Whether the node has children
 * @param {import('./types').LineType[]} parentTypes - Types from parent nodes
 * @param {import('./types').LineType} position - Current position type
 * @returns {import('./types').LineType[]} Array of line types
 */
export function getLineTypes(hasChildren = false, parentTypes = [], position = LINE_TYPES.CHILD) {
	return parentTypes
		.reduce((acc, type, index) => {
			// For all but the last parent type, convert to next type
			if (index < parentTypes.length - 1) {
				return [...acc, nextType[type]]
			}
			// For the last parent type, use the position
			return [...acc, position]
		}, [])
		.concat(hasChildren ? LINE_TYPES.ICON : LINE_TYPES.EMPTY)
}

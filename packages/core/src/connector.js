export function getLineTypes(
	hasChildren = false,
	parentTypes = [],
	position = 'child'
) {
	let types = parentTypes.slice(0, -1).map((type) => {
		return type === 'child' ? 'sibling' : type === 'last' ? 'empty' : type
	})
	if (parentTypes.length > 0) types.push(position)
	types.push(hasChildren ? 'icon' : 'empty')
	return types
}

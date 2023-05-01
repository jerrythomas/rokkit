export function getLineTypes(
	hasChildren = false,
	parentTypes = [],
	position = 'middle'
) {
	let types = parentTypes.slice(0, -1).map((type) => {
		return type === 'middle' ? 'line' : type === 'last' ? 'empty' : type
	})
	if (parentTypes.length > 0) types.push(position)
	types.push(hasChildren ? 'icon' : 'empty')
	return types
}

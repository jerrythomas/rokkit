export function getComponent(item, fields) {
	if (item && typeof item === 'object') {
		return item[fields.component] || fields.default
	}
	return fields.default
}

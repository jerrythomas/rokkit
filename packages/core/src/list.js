export function getComponent(item, fields) {
	if (item && typeof item === 'object') {
		return item[fields.component] || fields.default
	}
	return fields.default
}

// update position based on externally supplied value
export function updateCursor(cursor, value, items) {
	if (cursor.length > 0 && value != items[cursor[0]]) {
		let index = items.findIndex((x) => x == value)
		cursor = index > -1 ? [index] : []
	}
}

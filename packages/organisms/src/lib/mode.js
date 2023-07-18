export function findItemOnValueChange(
	value,
	items,
	fields,
	useSelectedItemValue = false
) {
	if (!useSelectedItemValue) {
		const matched = items.find((item) =>
			typeof item === 'object'
				? item[fields.id] ?? item[fields.text]
				: item === value
		)
		if (matched) return matched[fields.id] ?? matched[fields.text]
	}
	return value
}

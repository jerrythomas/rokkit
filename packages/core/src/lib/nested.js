import { omit } from 'ramda'

const defaultFields = {
	children: 'children',
	level: 'level',
	parent: 'parent'
}
export function flattenNestedList(items, fields = defaultFields, level = 0) {
	fields = { ...defaultFields, ...fields }
	let data = []
	items.map((item) => {
		const children = item[fields.children] ?? []
		data = [
			...data,
			{
				...omit([fields.children], item),
				[fields.level]: level,
				[fields.parent]: children.length > 0
			},
			...flattenNestedList(children, fields, level + 1)
		]
	})
	return data
}

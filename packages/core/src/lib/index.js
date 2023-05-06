export * from './nested'

export function getComponent(item, fields, using) {
	return fields.component
		? item[fields.component] ?? using.default
		: using.default
}

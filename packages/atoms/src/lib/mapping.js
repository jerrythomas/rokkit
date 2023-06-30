import { defaultFields } from './constants'

export function getComponent(value, fields, using) {
	return fields.component && typeof value == 'object'
		? using[value[fields.component]] ?? using.default
		: using.default
}

export function getIcon(value, fields = defaultFields) {
	if (fields.icon === undefined || typeof (value ?? '') !== 'object')
		return null

	return typeof value[fields.icon] == 'object'
		? value[fields.icon][value[fields.state]]
		: value[fields.icon]
}

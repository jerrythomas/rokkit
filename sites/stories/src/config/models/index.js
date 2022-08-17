import * as types from './input'

export const inputMenu = Object.keys(types).map((type) => ({
	text: `<Input type="${type}">`,
	icon: `i-input-${type}`,
	url: `/input/${type}`
}))

export const input = {
	componet: 'Input',
	types
}

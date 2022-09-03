// import * as types from '../../routes/input/[type]/types'

const types = [
	'text',
	'number',
	'email',
	'password',
	'date',
	'datetime',
	'time',
	'url'
]

export const inputMenu = types.map((type) => ({
	text: `<Input type="${type}">`,
	icon: `i-sparsh:input-${type}`,
	url: `/input/${type}`
}))

export const input = {
	componet: 'Input',
	types
}

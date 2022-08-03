import { inputTypes } from '@sparsh-ui/core'

const inputs = Object.keys(inputTypes).map((type) => ({
	text: 'input ' + type,
	url: '/input/' + type
}))
export const menu = [
	...inputs,
	{
		text: 'Home',
		url: '/'
	},
	{
		text: 'List',
		url: '/list'
	},
	{
		text: 'Accordion',
		url: '/accordion'
	},
	{
		text: 'Nested List',
		url: '/nested'
	},
	{
		text: 'Tree',
		url: '/tree'
	},
	{
		text: 'Connectors',
		url: '/connector'
	},
	{
		text: 'Scrollable',
		url: '/scrollable'
	},
	{
		text: 'Searchable',
		url: '/Searchable'
	}
]

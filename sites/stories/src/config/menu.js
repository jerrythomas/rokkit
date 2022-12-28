// import { inputTypes } from '@rokkit/core'
import { inputMenu } from './models'
// const inputs = Object.entries(inputTypes).map(([k, v]) => ({
// 	text: String(v.name).replace('Proxy', ''),
// 	url: '/input/' + k,
// 	icon: 'i-iconoir-input-field'
// }))

export const menu = [
	{
		text: 'Home',
		url: '/'
	},
	{ text: 'Input', data: inputMenu },
	{
		text: 'Lists',
		data: [
			{ text: '<List>', url: '/list', icon: 'i-carbon:list-dropdown' },
			{
				text: '<Accordion>',
				url: '/accordion',
				icon: 'i-carbon:list-dropdown'
			},
			{
				text: '<NestedList>',
				url: '/nested',
				icon: 'i-carbon-tree-view'
			},
			{
				text: '<Tree>',
				url: '/tree',
				icon: 'i-carbon:tree-view-alt'
			}
		]
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

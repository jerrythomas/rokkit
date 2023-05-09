import { items } from './02-fields/data.js'
import { defaultFields } from '@rokkit/core'
export const props = [
	{
		name: 'items',
		type: 'array',
		purpose: 'Supply the data for the accordion',
		required: true,
		example: JSON.stringify(items, null, 2)
	},
	{
		name: 'fields',
		type: '(@rokkit/core).FieldMapping',
		purpose: 'Adapt to your data by customising the fields',
		required: false,
		default: JSON.stringify(defaultFields, null, 2)
	},
	{
		name: 'using',
		type: 'object',
		purpose:
			'An object containing components to be used for displaying data. Uses the Text component by default.',
		required: false,
		default: '{ default: Text }'
	},
	{
		name: 'value',
		type: 'any',
		purpose: 'Current selected value of the accordion',
		required: false,
		default: 'null'
	},
	{
		name: 'class',
		type: 'string',
		purpose: 'Set custom class for style overrides',
		required: false,
		default: ''
	},
	{
		name: 'autoClose',
		type: 'boolean',
		purpose:
			'Enable of disable automatic closing of previous open section. Defaults to false',
		required: false,
		default: 'false'
	}
]

import { data } from './data'
import { omit } from 'ramda'
import { deriveSchemaFromValue, deriveLayoutFromValue } from '@rokkit/organisms/lib'

const themewithoutObjects = omit(['palette', 'status'], data.theme)
export const schema = [
	{
		path: '/theme',
		key: 'theme',
		type: 'object',
		schema: deriveSchemaFromValue(themewithoutObjects),
		layout: deriveLayoutFromValue(themewithoutObjects),
		// _open: true,
		children: [
			{
				path: '/theme/palette',
				key: 'primary',
				type: 'object',

				// _open: true,
				children: [
					{
						path: '/theme/palette/primary',
						key: 'primary',
						type: 'object',
						schema: deriveSchemaFromValue(data.theme.palette.primary),
						layout: deriveLayoutFromValue(data.theme.palette.primary),
						default: {}
					},
					{
						path: '/theme/palette/secondary',
						key: 'secondary',
						type: 'object',

						schema: deriveSchemaFromValue(data.theme.palette.secondary),
						layout: deriveLayoutFromValue(data.theme.palette.secondary),
						default: {}
					},
					{
						path: '/theme/palette/neutral',
						key: 'neutral',
						type: 'object',

						schema: deriveSchemaFromValue(data.theme.palette.neutral),
						layout: deriveLayoutFromValue(data.theme.palette.neutral),
						default: {}
					}
				]
			},
			{
				path: '/theme/status',
				key: 'status',
				type: 'object',

				// _open: true,
				children: [
					{
						path: '/theme/status/info',
						key: 'info',
						type: 'object',

						schema: deriveSchemaFromValue(data.theme.status.info),
						layout: deriveLayoutFromValue(data.theme.status.info),
						default: {}
					},
					{
						path: '/theme/status/warning',
						key: 'warning',
						type: 'object',

						schema: deriveSchemaFromValue(data.theme.status.warn),
						layout: deriveLayoutFromValue(data.theme.status.warn),
						default: {}
					}
				]
			}
		]
	},
	{
		path: '/departments',
		type: 'array',

		key: 'departments',
		items: {
			type: 'string'
		},
		default: []
	},
	{
		path: '/modules',
		type: 'array',

		key: 'modules',
		default: [],
		items: {
			type: 'object',
			properties: {
				name: {
					type: 'string'
				},
				path: {
					type: 'string'
				}
			}
		},
		layout: deriveLayoutFromValue(data.modules[0])
	}
]

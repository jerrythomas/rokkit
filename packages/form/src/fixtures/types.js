export const dataTypes = [
	[
		'string without length',
		{
			schema: { type: 'string' },
			expected: { component: 'Input', properties: { type: 'textarea' } }
		}
	],
	[
		'string with length <= 255',
		{
			schema: { type: 'string', maxLength: 100 },
			expected: {
				component: 'Input',
				properties: { type: 'text', maxLength: 100 }
			}
		}
	],
	[
		'string with length > 255',
		{
			schema: { type: 'string', maxLength: 256 },
			expected: {
				component: 'Input',
				properties: { type: 'textarea', maxLength: 256 }
			}
		}
	],
	[
		'integer',
		{
			schema: { type: 'integer' },
			expected: {
				component: 'Input',
				properties: { type: 'number', pattern: '^[0-9]+$' }
			}
		}
	],
	[
		'integer with pattern',
		{
			schema: { type: 'integer', pattern: '^[0-8]+$' },
			expected: {
				component: 'Input',
				properties: { type: 'number', pattern: '^[0-8]+$' }
			}
		}
	],
	[
		'float',
		{
			schema: { type: 'float' },
			expected: {
				component: 'Input',
				properties: { type: 'number', pattern: '^[0-9]+.[0-9]+$' }
			}
		}
	],
	[
		'float',
		{
			schema: { type: 'float', pattern: '^[0-9]+.[0-9]+(e[0-9]+)?$' },
			expected: {
				component: 'Input',
				properties: { type: 'number', pattern: '^[0-9]+.[0-9]+(e[0-9]+)?$' }
			}
		}
	],
	[
		'uuid',
		{
			schema: { type: 'uuid' },
			expected: {
				component: 'Input',
				properties: {
					type: 'text',
					pattern:
						'^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$'
				}
			}
		}
	],
	[
		'boolean',
		{
			schema: { type: 'boolean' },
			expected: {
				component: 'Input',
				properties: { type: 'checkbox' }
			}
		}
	],
	[
		'enum',
		{
			schema: {
				type: 'enum',
				items: [
					{ text: 'Yes', value: 'Yes' },
					{ text: 'No', value: 'No' }
				]
			},
			expected: {
				component: 'Input',
				properties: {
					type: 'radio',
					items: [
						{ text: 'Yes', value: 'Yes' },
						{ text: 'No', value: 'No' }
					]
				}
			}
		}
	],
	[
		'enum choices > 3',
		{
			schema: {
				type: 'enum',
				items: [{ text: '1' }, { text: '2' }, { text: '3' }, { text: '4' }]
			},
			expected: {
				component: 'Input',
				properties: {
					type: 'select',
					items: [{ text: '1' }, { text: '2' }, { text: '3' }, { text: '4' }]
				}
			}
		}
	],
	[
		'email',
		{
			schema: {
				type: 'email'
			},
			expected: {
				component: 'Input',
				properties: { type: 'email' }
			}
		}
	],
	[
		'password',
		{
			schema: {
				type: 'password'
			},
			expected: {
				component: 'Input',
				properties: { type: 'password' }
			}
		}
	],
	[
		'custom',
		{
			schema: {
				type: 'custom',
				component: 'Custom'
			},
			expected: {
				component: 'Custom',
				properties: { type: 'custom' }
			}
		}
	]
]

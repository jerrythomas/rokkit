export const schema = [
	{
		key: 'tenant',
		type: 'object',
		scope: '#/tenant',
		properties: {
			name: {
				type: 'string',
				required: true,
				maxLength: 100
			},
			industry: {
				type: 'enum',
				options: ['Retail', 'Healthcare', 'Technology', 'Finance']
			}
		},
		layout: {
			type: 'vertical',
			elements: [
				{
					label: 'name',
					scope: '#/name'
				},
				{
					label: 'industry',
					scope: '#/industry'
				}
			]
		}
	},
	{
		key: 'services',
		type: 'object',
		scope: '#/services',
		_open: true,
		children: [
			{
				key: 'identity',
				type: 'object',
				scope: '#/services/identity',
				properties: {
					provider: {
						type: 'enum',
						options: ['Okta', 'Auth0', 'AWS Cognito']
					},
					url: {
						type: 'url',
						required: true
					}
				}
			}
		]
	}
]

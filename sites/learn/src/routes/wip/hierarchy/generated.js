export const schema = [
	{
		key: 'tenant',
		type: 'object',
		scope: '#/tenant',
		properties: {
			name: {
				type: 'string',
				default: 'Walgreens'
			},
			industry: {
				type: 'string',
				default: 'Retail'
			},
			domain: {
				type: 'string',
				default: 'Health & Wellness'
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
				},
				{
					label: 'domain',
					scope: '#/domain'
				}
			]
		}
	},
	{
		key: 'services',
		type: 'object',
		scope: '#/services',
		children: [
			{
				key: 'identity',
				type: 'object',
				scope: '#/services/identity',
				properties: {
					provider: {
						type: 'string',
						default: 'Okta'
					},
					url: {
						type: 'string',
						default: 'https://walgreens.okta.com'
					}
				},
				layout: {
					type: 'vertical',
					elements: [
						{
							label: 'provider',
							scope: '#/provider'
						},
						{
							label: 'url',
							scope: '#/url'
						}
					]
				}
			},
			{
				key: 'storage',
				type: 'object',
				scope: '#/services/storage',
				properties: {
					provider: {
						type: 'string',
						default: 'Azure'
					},
					url: {
						type: 'string',
						default: 'https://walgreens.blob.core.windows.net'
					}
				},
				layout: {
					type: 'vertical',
					elements: [
						{
							label: 'provider',
							scope: '#/provider'
						},
						{
							label: 'url',
							scope: '#/url'
						}
					]
				}
			}
		]
	},
	{
		key: 'modules',
		type: 'object',
		scope: '#/modules',
		children: [
			{
				key: 'inventory',
				type: 'object',
				scope: '#/modules/inventory',
				properties: {
					minimum_stock: {
						type: 'number',
						default: 10
					},
					restock_threshold: {
						type: 'number',
						default: 20
					},
					max_age: {
						type: 'number',
						default: 365
					}
				},
				layout: {
					type: 'vertical',
					elements: [
						{
							label: 'minimum_stock',
							scope: '#/minimum_stock'
						},
						{
							label: 'restock_threshold',
							scope: '#/restock_threshold'
						},
						{
							label: 'max_age',
							scope: '#/max_age'
						}
					]
				}
			}
		]
	},
	{
		key: 'instance',
		type: 'object',
		scope: '#/instance',
		properties: {
			type: {
				type: 'string',
				default: 'production'
			},
			language: {
				type: 'string',
				default: 'en-US'
			},
			time_zone: {
				type: 'string',
				default: 'EST'
			}
		},
		layout: {
			type: 'vertical',
			elements: [
				{
					label: 'type',
					scope: '#/type'
				},
				{
					label: 'language',
					scope: '#/language'
				},
				{
					label: 'time_zone',
					scope: '#/time_zone'
				}
			]
		}
	}
]

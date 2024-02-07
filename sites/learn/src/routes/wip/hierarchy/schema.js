// import { data } from './data'
// import { omit } from 'ramda'
// import { deriveSchemaFromValue, deriveLayoutFromValue } from '@rokkit/organisms/lib'

export const schema = [
	{
		key: 'tenant',
		type: 'object',
		scope: '#/tenant',
		properties: {
			name: {
				type: 'string',
				default: 'Walgreens',
				required: true,
				maxLength: 100
			},
			industry: {
				type: 'enum',
				default: 'Retail',
				options: ['Retail', 'Healthcare', 'Technology', 'Finance', 'Manufacturing']
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
		_open: true,
		children: [
			{
				key: 'identity',
				type: 'object',
				scope: '#/services/identity',
				properties: {
					provider: {
						type: 'enum',
						default: 'Okta',
						options: ['Okta', 'Auth0', 'AWS Cognito', 'Azure AD']
					},
					url: {
						type: 'url',
						default: 'https://walgreens.okta.com',
						required: true
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
						type: 'enum',
						default: 'Azure',
						options: ['Azure', 'AWS', 'Google Cloud', 'IBM Cloud']
					},
					url: {
						type: 'url',
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
		_open: true,
		children: [
			{
				key: 'inventory',
				type: 'object',
				scope: '#/modules/inventory',
				properties: {
					minimum_stock: {
						type: 'number',
						default: 10,
						min: 0,
						max: 50
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
							label: 'minimum stock',
							scope: '#/minimum_stock'
						},
						{
							label: 'restock threshold',
							scope: '#/restock_threshold'
						},
						{
							label: 'maximum age',
							scope: '#/max_age'
						}
					]
				}
			},
			{
				key: 'perishable',
				type: 'object',
				scope: '#/modules/perishable',
				properties: {
					minimum_stock: {
						type: 'number',
						default: 5,
						min: 0,
						max: 50
					},
					restock_threshold: {
						type: 'number',
						default: 10
					},
					max_age: {
						type: 'number',
						default: 30,
						min: 0,
						max: 45
					}
				},
				layout: {
					type: 'vertical',
					elements: [
						{
							label: 'minimum stock',
							scope: '#/minimum_stock'
						},
						{
							label: 'restock threshold',
							scope: '#/restock_threshold'
						},
						{
							label: 'maximum age',
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
				type: 'enum',
				default: 'production',
				options: ['production', 'staging', 'development', 'testing', 'debug']
			},
			language: {
				type: 'enum',
				default: 'en-US',
				options: ['en-US', 'es-US', 'fr-CA', 'en-GB', 'en-AU']
			},
			time_zone: {
				type: 'enum',
				default: 'EST',
				options: ['EST', 'CST', 'MST', 'PST', 'AKST', 'HST', 'IST']
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

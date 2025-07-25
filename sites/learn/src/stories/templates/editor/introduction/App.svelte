<script>
	import { NestedEditor } from '@rokkit/forms'

	const schema = [
		{
			key: 'tenant',
			type: 'object',
			scope: '#/tenant',
			properties: {
				name: {
					type: 'string',
					default: 'Example',
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
					default: null
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
							default: 'https://example.okta.com',
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
				}
			]
		}
	]

	let value = $state({
		tenant: {
			name: 'Example Corp',
			industry: 'Technology',
			domain: 'example.com'
		},
		services: {
			identity: {
				provider: 'Okta',
				url: 'https://example.okta.com'
			}
		}
	})
</script>

<div class="border-surface-z2 flex h-96 overflow-hidden rounded-lg border">
	<NestedEditor bind:value {schema} />
</div>

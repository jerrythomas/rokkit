export const providers = [
	{ provider: 'magic', label: 'email for Magic Link', scopes: [], params: [] },
	{ provider: 'google', label: 'Google', scopes: [], params: [] },
	{
		provider: 'microsoft',
		label: 'Microsoft',
		scopes: [],
		params: [{ prompt: 'consent', domain_hint: 'organizations' }]
	}
]

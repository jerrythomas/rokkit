const names = [
	'Microsoft',
	'Google',
	'Facebook',
	'Twitter',
	'GitHub',
	'LinkedIn',
	'Apple',
	'Mail',
	'Phone'
]

export const providers = [
	{ name: 'magic', label: 'email for Magic Link', scopes: [], params: [] }
	// ...names.map((name) => ({
	// 	name: name.toLowerCase(),
	// 	label: 'Sign in with ' + name,
	// 	scopes: [],
	// 	params:
	// 		name === 'Microsoft'
	// 			? [{ prompt: 'consent', domain_hint: 'organizations' }]
	// 			: []
	// }))
]

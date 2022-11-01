/**
 * @typedef Provider
 * @property {'otp'|'oauth'|'password'} mode - mode of auth
 * @property {string} name - the name of the provider
 * @property {string} label - label to be used in the input or button
 * @property {Array<string>} scopes - array of scopes for access
 * @property {Array<string>} params - array of parameters for access
 */

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

/** @type {Array<Provider>} **/
export const providers = [
	{
		mode: 'otp',
		name: 'magic',
		label: 'email for Magic Link',
		scopes: [],
		params: []
	}
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

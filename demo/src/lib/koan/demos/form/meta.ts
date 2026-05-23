import type { DemoMeta } from '../../types'

const meta: DemoMeta = {
	id: 'form',
	title: 'Schema-driven Form',
	description:
		'Schema in, validated form out. FormRenderer reads a JSON-Schema-ish object and renders the right input per type, with built-in validation and dirty tracking.',
	keywords: [
		'form', 'forms', 'input', 'inputs', 'fields', 'field',
		'schema', 'validation', 'validate', 'sign-up', 'signup',
		'register', 'login', 'contact', 'json-schema', 'data'
	],
	category: 'forms',
	icon: '入',
	load: () => import('./placeholder.svelte')
}

export default meta

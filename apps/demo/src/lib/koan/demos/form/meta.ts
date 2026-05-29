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
	load: () => import('./placeholder.svelte'),
	tool: {
		name: 'mount_form',
		description:
			'Mount a schema-driven FormRenderer on the canvas. Use when the user wants a form built from a JSON-Schema-ish object — sign-up, contact, settings, etc.',
		parameters: {
			data: 'object — bound form data',
			schema: 'JSON-Schema-ish object with `properties`; type + format + enum + required drive rendering and validation'
		}
	},
	inline: { capable: true },
	variants: [
		{ id: 'multi-step', label: 'Multi-step form', mode: 'dynamic' },
		{ id: 'conditional', label: 'Conditional fields', mode: 'dynamic' },
		{ id: 'with-lookups', label: 'Async lookups', mode: 'dynamic' }
	]
}

export default meta

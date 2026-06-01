import type { DemoMeta } from '../../types'
import docs from './docs.md?raw'
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
	],
	api: {
		props: [
			{ name: 'schema', type: 'JsonSchema', desc: 'JSON-Schema-ish object with `properties`; type + format + enum + required drive rendering' },
			{ name: 'data', type: 'object', default: '{}', desc: 'Form values', bindable: true },
			{ name: 'layout', type: 'LayoutNode', desc: 'Optional layout tree — overrides default vertical stack' },
			{ name: 'lookups', type: 'Record<string, LookupSpec>', desc: 'Async/sync lookups keyed by JSON-Schema property path' },
			{ name: 'validateOn', type: "'submit' | 'change' | 'blur'", default: "'submit'", desc: 'When validation fires' },
			{ name: 'renderers', type: 'Record<string, Component>', desc: 'Custom renderer registry — keyed by renderer id' },
			{ name: 'disabled', type: 'boolean', default: 'false', desc: 'Disable the entire form' }
		],
		events: [
			{ name: 'onsubmit', signature: '(data) => void', desc: 'Fires when validation passes and the user submits' },
			{ name: 'onupdate', signature: '(data) => void', desc: 'Fires on every value change' },
			{ name: 'oninvalid', signature: '(errors) => void', desc: 'Fires when validation fails on submit' }
		],
		attrs: [
			{ selector: '[data-form-root]', desc: 'Root <form> container' },
			{ selector: '[data-form-field]', desc: 'Single-field wrapper' },
			{ selector: '[data-form-group]', desc: 'Fieldset wrapper for nested objects' },
			{ selector: '[data-form-actions]', desc: 'Submit/reset button row' }
		]
	},
	snippets: [
		{
			id: 'intro',
			title: 'Basic — sign-up form',
			lang: 'svelte',
			code: `<script>
  import { FormRenderer } from '@rokkit/forms'
  const schema = {
    type: 'object',
    properties: {
      name:    { type: 'string', minLength: 2 },
      email:   { type: 'string', format: 'email' },
      age:     { type: 'integer', minimum: 13 },
      consent: { type: 'boolean' }
    },
    required: ['name', 'email', 'consent']
  }
  let data = $state({ name: '', email: '', age: null, consent: false })
</script>

<FormRenderer bind:data {schema} onsubmit={(d) => console.log(d)} />`
		},
		{
			id: 'enum',
			title: 'Enum → radio / select',
			lang: 'svelte',
			code: `const schema = {
  type: 'object',
  properties: {
    plan: {
      type: 'string',
      enum: ['Free', 'Pro', 'Team']
    }
  }
}`
		},
		{
			id: 'layout',
			title: 'Layout — group fields into rows',
			lang: 'svelte',
			code: `const layout = {
  type: 'vertical',
  elements: [
    { type: 'horizontal', elements: [
      { scope: '#/firstName' },
      { scope: '#/lastName' }
    ]},
    { scope: '#/email' }
  ]
}

<FormRenderer bind:data {schema} {layout} />`
		},
		{
			id: 'lookups',
			title: 'Async lookups',
			lang: 'svelte',
			code: `const lookups = {
  '#/countryCode': {
    url: '/api/countries?prefix={query}',
    label: 'name',
    value: 'code'
  },
  '#/city': {
    fetch: async ({ data }) => fetchCities(data.countryCode)
  }
}

<FormRenderer bind:data {schema} {lookups} />`
		}
	],
	docs
}

export default meta

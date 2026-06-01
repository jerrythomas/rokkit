import type { DemoMeta } from '../../types'
import docs from './docs.md?raw'
const meta: DemoMeta = {
	id: 'pill',
	title: 'Pill',
	description: 'Compact, optionally-removable tag for filters, chips, and inline selected values.',
	keywords: ['pill', 'pills', 'tag', 'chip', 'token', 'filter', 'removable'],
	category: 'feedback',
	icon: '丸',
	load: () => import('./index.svelte'),
	tool: {
		name: 'mount_pill',
		description: 'Mount a Pill gallery — simple, removable, disabled variants.',
		parameters: { value: 'primitive or object value' }
	},
	inline: { capable: true },
	variants: [],
	api: {
		props: [
			{ name: 'value', type: 'unknown', desc: 'Primitive value or object item' },
			{ name: 'fields', type: 'FieldMapping', desc: 'Remap data keys (label, icon)' },
			{ name: 'removable', type: 'boolean', default: 'false', desc: 'Show remove button + handle Delete/Backspace' },
			{ name: 'disabled', type: 'boolean', default: 'false', desc: 'Disable interaction' },
			{ name: 'icons', type: '{ remove?: string }', desc: 'Override the remove icon' },
			{ name: 'class', type: 'string', default: "''", desc: 'Extra CSS classes' }
		],
		events: [
			{ name: 'onremove', signature: '(value) => void', desc: 'Fires on remove click or Delete/Backspace key' }
		],
		attrs: [
			{ selector: '[data-pill]', desc: 'Root span (carries data-removable, data-disabled)' },
			{ selector: '[data-pill-remove]', desc: 'Remove button' }
		]
	},
	snippets: [
		{ id: 'intro', title: 'Basic', lang: 'svelte', code: `<Pill value="svelte" />` },
		{ id: 'removable', title: 'Removable', lang: 'svelte',
			code: `<Pill value="svelte" removable onremove={(v) => removeTag(v)} />` }
	],
	docs
}

export default meta

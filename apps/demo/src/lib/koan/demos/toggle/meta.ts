import type { DemoMeta } from '../../types'
import { toggleDocs } from './docs'

const meta: DemoMeta = {
	id: 'toggle',
	title: 'Toggle',
	description: 'Segmented control — N mutually-exclusive options visible all at once. Counterpart to Select dropdown.',
	keywords: ['toggle', 'segmented', 'control', 'button-group', 'options', 'switcher', 'tabs-like'],
	category: 'forms',
	icon: '段',
	load: () => import('./index.svelte'),
	inline: { capable: true },
	variants: [],
	api: {
		props: [
			{ name: 'options', type: 'any[]', default: '[]', desc: 'Array of strings or objects with label/value/icon' },
			{ name: 'fields', type: 'FieldMapping', desc: 'Remap data keys (label, value, icon)' },
			{ name: 'value', type: 'any', desc: 'Currently selected option value', bindable: true },
			{ name: 'variant', type: "'group' | 'button'", default: "'group'", desc: 'Segmented group vs cycle-button' },
			{ name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", desc: 'Control density' },
			{ name: 'showLabels', type: 'boolean', default: 'true', desc: 'Render text labels (off → icons only)' },
			{ name: 'disabled', type: 'boolean', default: 'false', desc: 'Disable interaction' },
			{ name: 'label', type: 'string', desc: 'aria-label for the radiogroup' }
		],
		events: [
			{ name: 'onchange', signature: '(value, item) => void', desc: 'Fires on selection change' }
		],
		attrs: [
			{ selector: '[data-toggle]', desc: 'Root container (carries data-variant, data-size, data-toggle-labels)' },
			{ selector: '[data-toggle-option]', desc: 'Individual option (carries data-selected, data-disabled)' },
			{ selector: '[data-toggle-icon]', desc: 'Icon span inside an option' },
			{ selector: '[data-toggle-label]', desc: 'Label text inside an option' }
		]
	},
	snippets: [
		{ id: 'intro', title: 'Segmented group', lang: 'svelte',
			code: `<Toggle\n  options={[\n    { label: 'List', value: 'list' },\n    { label: 'Grid', value: 'grid' }\n  ]}\n  bind:value\n/>` },
		{ id: 'icons', title: 'With icons', lang: 'svelte',
			code: `<Toggle\n  options={[\n    { label: 'Left',  value: 'left',  icon: 'i-mdi:format-align-left' },\n    { label: 'Right', value: 'right', icon: 'i-mdi:format-align-right' }\n  ]}\n  bind:value\n/>` }
	],
	docs: toggleDocs
}

export default meta

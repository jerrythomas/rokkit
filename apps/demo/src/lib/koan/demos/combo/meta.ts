import type { DemoMeta } from '../../types'
import { comboDocs } from './docs'

const meta: DemoMeta = {
	id: 'combo',
	title: 'Combobox',
	description:
		'Filterable Select — type to narrow the options. The same Select component with the `filterable` flag flipped.',
	keywords: [
		'combo', 'combobox', 'autocomplete', 'auto-complete', 'auto complete',
		'typeahead', 'type-ahead', 'filter', 'filterable', 'search',
		'searchable', 'narrow', 'country', 'countries'
	],
	category: 'forms',
	icon: '探',
	load: () => import('./placeholder.svelte'),
	tool: {
		name: 'mount_combobox',
		description:
			'Mount a filterable Select (combobox / autocomplete). Use when the option count is large enough that typing beats scrolling — countries, users, products, etc. For short fixed lists prefer mount_select.',
		parameters: {
			items: 'Array<{ label, value }> options (typically 15+)',
			value: 'optional pre-selected value',
			placeholder: 'optional trigger placeholder text'
		}
	},
	inline: { capable: true },
	variants: [
		{ id: 'no-filter', label: 'Plain Select (no filter)', mode: 'dynamic', props: { filterable: false } },
		{ id: 'with-counts', label: 'Show match count', mode: 'dynamic' }
	],
	props: {
		filterable: {
			type: 'boolean',
			default: true,
			desc: 'Type-to-narrow input; off renders as a plain Select'
		}
	},
	api: {
		props: [
			{ name: 'items', type: 'any[]', default: '[]', desc: 'Options to choose from' },
			{ name: 'fields', type: 'FieldMapping', desc: 'Remap data keys to component fields' },
			{ name: 'value', type: 'any', default: 'null', desc: 'Currently selected value', bindable: true },
			{ name: 'filterable', type: 'boolean', default: 'true', desc: 'Show a filter input above the dropdown options' },
			{ name: 'filterPlaceholder', type: 'string', desc: 'Placeholder for the filter input' },
			{ name: 'placeholder', type: 'string', default: "'Select…'", desc: 'Trigger placeholder when nothing is selected' },
			{ name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", desc: 'Density' },
			{ name: 'disabled', type: 'boolean', default: 'false', desc: 'Disable the combobox' }
		],
		events: [
			{ name: 'onchange', signature: '(value, item) => void', desc: 'Fires on selection change' }
		],
		attrs: [
			{ selector: '[data-select]', desc: 'Root container (Combobox is Select with filterable=true)' },
			{ selector: '[data-select-trigger]', desc: 'Trigger button' },
			{ selector: '[data-dropdown-filter]', desc: 'Filter <input> at the top of the dropdown' }
		]
	},
	snippets: [
		{
			id: 'intro',
			title: 'Basic — type to narrow',
			lang: 'svelte',
			code: `<script>
  import { Select } from '@rokkit/ui'
  const countries = [
    { name: 'Australia', code: 'AU' },
    { name: 'Brazil',    code: 'BR' },
    { name: 'Canada',    code: 'CA' }
    /* …195 more rows */
  ]
  let code = $state(null)
</script>

<Select
  items={countries}
  fields={{ text: 'name', value: 'code' }}
  bind:value={code}
  filterable
  filterPlaceholder="Type a country…"
/>`
		},
		{
			id: 'plain',
			title: 'Same items, filter off',
			lang: 'svelte',
			code: `<Select
  items={countries}
  fields={{ text: 'name', value: 'code' }}
  bind:value={code}
  filterable={false}
/>`
		}
	],
	docs: comboDocs
}

export default meta

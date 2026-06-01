import type { DemoMeta } from '../../types'
import docs from './docs.md?raw'
const meta: DemoMeta = {
	id: 'select',
	title: 'Select',
	description:
		'Single-pick dropdown. Field-mapped items, keyboard nav, bound value. The flat single-pick counterpart to MultiSelect.',
	keywords: [
		'select', 'dropdown', 'picker', 'choose', 'pick',
		'option', 'options', 'single', 'combo', 'combobox',
		'enum', 'choice', 'choices'
	],
	category: 'forms',
	icon: '択',
	load: () => import('./placeholder.svelte'),
	tool: {
		name: 'mount_select',
		description:
			'Mount a single-pick Select dropdown. Use for short to moderately-long lists where the user picks one value. For 20+ items where typing helps, prefer the combobox tool.',
		parameters: {
			items: 'Array<{ label, value }> options',
			value: 'optional pre-selected value',
			maxRows: 'optional max visible rows in dropdown (default 8)',
			placeholder: 'optional trigger placeholder text'
		}
	},
	inline: { capable: true },
	variants: [
		{ id: 'grouped', label: 'Grouped options', mode: 'dynamic' },
		{ id: 'with-icons', label: 'Options with icons', mode: 'dynamic' }
	],
	api: {
		props: [
			{ name: 'items', type: 'any[]', default: '[]', desc: 'Options — objects or grouped option arrays' },
			{ name: 'fields', type: 'FieldMapping', desc: 'Remap data keys to component fields' },
			{ name: 'value', type: 'any', default: 'null', desc: 'Currently selected value', bindable: true },
			{ name: 'selected', type: 'any', desc: 'Currently selected raw item object', bindable: true },
			{ name: 'placeholder', type: 'string', default: "'Select…'", desc: 'Trigger placeholder when nothing is selected' },
			{ name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", desc: 'Trigger + option density' },
			{ name: 'align', type: "'start' | 'end'", default: "'start'", desc: 'Dropdown horizontal alignment' },
			{ name: 'direction', type: "'down' | 'up'", default: "'down'", desc: 'Dropdown open direction' },
			{ name: 'disabled', type: 'boolean', default: 'false', desc: 'Disable the entire select' },
			{ name: 'filterable', type: 'boolean', default: 'false', desc: 'Show a filter input above the options' },
			{ name: 'filterPlaceholder', type: 'string', desc: 'Placeholder for the filter input' }
		],
		events: [
			{ name: 'onchange', signature: '(value, item) => void', desc: 'Fires on selection change — receives extracted value + raw item' }
		],
		attrs: [
			{ selector: '[data-select]', desc: 'Root container' },
			{ selector: '[data-select-trigger]', desc: 'Trigger button' },
			{ selector: '[data-dropdown]', desc: 'Options dropdown panel' },
			{ selector: '[data-option]', desc: 'Individual option (carries data-selected)' }
		]
	},
	snippets: [
		{
			id: 'intro',
			title: 'Basic — array of objects',
			lang: 'svelte',
			code: `<script>
  import { Select } from '@rokkit/ui'
  const items = [
    { text: 'Light', value: 'light' },
    { text: 'Dark',  value: 'dark' },
    { text: 'Auto',  value: 'auto' }
  ]
  let mode = $state('light')
</script>

<Select {items} bind:value={mode} placeholder="Pick theme mode" />`
		},
		{
			id: 'fields',
			title: 'Field mapping',
			lang: 'svelte',
			code: `<Select
  items={countries}
  fields={{ text: 'name', value: 'code', icon: 'flag' }}
  bind:value={countryCode}
/>`
		},
		{
			id: 'filterable',
			title: 'Filterable — type to narrow',
			lang: 'svelte',
			code: `<Select
  items={countries}
  fields={{ text: 'name', value: 'code' }}
  filterable
  filterPlaceholder="Type a country…"
/>`
		}
	],
	docs
}

export default meta

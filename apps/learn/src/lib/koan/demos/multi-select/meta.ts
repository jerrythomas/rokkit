import type { DemoMeta } from '../../types'
import docs from './docs.md?raw'
const meta: DemoMeta = {
	id: 'multi-select',
	title: 'Multi-Select',
	description:
		'Pick many values from a dropdown. Selected items render as chips inside the trigger; click a chip to remove.',
	keywords: [
		'multi', 'multi-select', 'multiselect', 'multiple', 'select',
		'pick', 'choose', 'chips', 'chip', 'tags', 'tag', 'options',
		'checkbox', 'checkboxes', 'combo'
	],
	category: 'forms',
	icon: '選',
	load: () => import('./placeholder.svelte'),
	tool: {
		name: 'mount_multi_select',
		description:
			'Mount a MultiSelect on the canvas. Use when the user needs to pick multiple values from a list — tags, multi-pick filters, role assignment.',
		parameters: {
			items: 'Array<{ label, value }> options',
			value: 'optional array of pre-selected values',
			placeholder: 'optional trigger placeholder text'
		}
	},
	inline: { capable: true },
	variants: [
		{ id: 'with-counts', label: 'With selection count', mode: 'dynamic' },
		{ id: 'no-overflow', label: 'No chip overflow', mode: 'dynamic' }
	],
	api: {
		props: [
			{ name: 'items', type: 'any[]', default: '[]', desc: 'Options — objects or grouped option arrays' },
			{ name: 'fields', type: 'FieldMapping', desc: 'Remap data keys to component fields' },
			{ name: 'value', type: 'any[]', default: '[]', desc: 'Array of selected values', bindable: true },
			{ name: 'selected', type: 'any[]', default: '[]', desc: 'Array of selected raw item objects', bindable: true },
			{ name: 'placeholder', type: 'string', default: "'Select…'", desc: 'Trigger placeholder when nothing is selected' },
			{ name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", desc: 'Trigger + option density' },
			{ name: 'maxDisplay', type: 'number', default: '3', desc: 'Max chips shown in the trigger before the +N badge' },
			{ name: 'align', type: "'start' | 'end'", default: "'start'", desc: 'Dropdown horizontal alignment' },
			{ name: 'direction', type: "'down' | 'up'", default: "'down'", desc: 'Dropdown open direction' },
			{ name: 'disabled', type: 'boolean', default: 'false', desc: 'Disable the entire multi-select' }
		],
		events: [
			{ name: 'onchange', signature: '(values, items) => void', desc: 'Fires on selection change — receives values + raw item objects' }
		],
		attrs: [
			{ selector: '[data-multi-select]', desc: 'Root container' },
			{ selector: '[data-trigger]', desc: 'Trigger button (carries chips)' },
			{ selector: '[data-chip]', desc: 'Individual selection chip' },
			{ selector: '[data-dropdown]', desc: 'Options dropdown panel' }
		]
	},
	snippets: [
		{
			id: 'intro',
			title: 'Basic — array of values',
			lang: 'svelte',
			code: `<script>
  import { MultiSelect } from '@rokkit/ui'
  const items = [
    { text: 'Red',   value: 'r' },
    { text: 'Green', value: 'g' },
    { text: 'Blue',  value: 'b' }
  ]
  let selected = $state(['r', 'g'])
</script>

<MultiSelect {items} bind:value={selected} placeholder="Pick colors" />`
		},
		{
			id: 'fields',
			title: 'Field mapping',
			lang: 'svelte',
			code: `<MultiSelect
  items={users}
  fields={{ text: 'name', value: 'id' }}
  bind:value={selectedIds}
/>`
		},
		{
			id: 'grouped',
			title: 'Grouped options',
			lang: 'svelte',
			code: `<MultiSelect
  items={[
    { text: 'Fruits', children: [
      { text: 'Apple',  value: 'a' },
      { text: 'Banana', value: 'b' }
    ]},
    { text: 'Vegetables', children: [
      { text: 'Carrot', value: 'c' },
      { text: 'Dill',   value: 'd' }
    ]}
  ]}
  bind:value
  maxDisplay={2}
/>`
		}
	],
	docs
}

export default meta

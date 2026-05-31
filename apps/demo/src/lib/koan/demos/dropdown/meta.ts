import type { DemoMeta } from '../../types'
import { dropdownDocs } from './docs'

const meta: DemoMeta = {
	id: 'dropdown',
	title: 'Dropdown',
	description: 'Single-value picker whose trigger reflects the current selection — short, in-place lists.',
	keywords: [
		'dropdown', 'picker', 'combo', 'value-select', 'short-select',
		'enum-picker'
	],
	category: 'navigation',
	icon: '降',
	load: () => import('./index.svelte'),
	tool: {
		name: 'mount_dropdown',
		description: 'Mount a Dropdown picker on the canvas.',
		parameters: { items: 'array of value objects', placeholder: 'string' }
	},
	inline: { capable: true },
	variants: [],
	api: {
		props: [
			{ name: 'items', type: 'unknown[]', default: '[]', desc: 'Option objects (`label`, `value`, optional `icon`)' },
			{ name: 'fields', type: 'Record<string, string>', desc: 'Remap data keys to component fields' },
			{ name: 'value', type: 'unknown', desc: 'Currently selected value', bindable: true },
			{ name: 'placeholder', type: 'string', desc: 'Trigger label when no value is selected' },
			{ name: 'icon', type: 'string', desc: 'Icon shown in the trigger' },
			{ name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", desc: 'Size variant' },
			{ name: 'align', type: "'start' | 'end'", default: "'start'", desc: 'Panel alignment relative to trigger' },
			{ name: 'direction', type: "'up' | 'down'", default: "'down'", desc: 'Panel expansion direction' },
			{ name: 'showArrow', type: 'boolean', default: 'true', desc: 'Show the chevron in the trigger' },
			{ name: 'disabled', type: 'boolean', default: 'false', desc: 'Disable interaction' },
			{ name: 'class', type: 'string', default: "''", desc: 'Extra CSS classes' }
		],
		events: [
			{ name: 'onchange', signature: '(value, item) => void', desc: 'Fires when the selection changes' }
		],
		attrs: [
			{ selector: '[data-dropdown]', desc: 'Root (carries data-size, data-align, data-direction, data-open)' },
			{ selector: '[data-dropdown-trigger]', desc: 'Trigger button' },
			{ selector: '[data-dropdown-panel]', desc: 'Options panel' },
			{ selector: '[data-dropdown-option]', desc: 'Each option (carries data-active on the selected one)' }
		]
	},
	snippets: [
		{
			id: 'intro',
			title: 'Basic — bound value',
			lang: 'svelte',
			code: `<script>
  import { Dropdown } from '@rokkit/ui'

  const fonts = [
    { label: 'System UI', value: 'system' },
    { label: 'Serif',     value: 'serif' },
    { label: 'Mono',      value: 'mono' }
  ]

  let font = $state('system')
</script>

<Dropdown items={fonts} bind:value={font} />`
		},
		{
			id: 'placeholder',
			title: 'With placeholder + icon',
			lang: 'svelte',
			code: `<Dropdown
  items={timezones}
  bind:value={tz}
  placeholder="Select a timezone"
  icon="i-mdi:clock-outline"
/>`
		},
		{
			id: 'alignment',
			title: 'End-aligned, up direction',
			lang: 'svelte',
			code: `<Dropdown items={options} bind:value align="end" direction="up" />`
		}
	],
	docs: dropdownDocs
}

export default meta

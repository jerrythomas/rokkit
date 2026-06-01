import type { DemoMeta } from '../../types'
import docs from './docs.md?raw'
const meta: DemoMeta = {
	id: 'menu',
	title: 'Menu',
	description: 'Click-to-open dropdown of actions — leaves + groups, keyboard nav, alignment + direction.',
	keywords: [
		'menu', 'dropdown', 'actions', 'context-menu', 'overflow-menu',
		'kebab', 'meatball', 'command', 'list'
	],
	category: 'navigation',
	icon: '單',
	load: () => import('./index.svelte'),
	tool: {
		name: 'mount_menu',
		description: 'Mount a Menu trigger + dropdown on the canvas.',
		parameters: { label: 'trigger button label', items: 'array of menu items' }
	},
	inline: { capable: true },
	variants: [],
	api: {
		props: [
			{ name: 'items', type: 'unknown[]', default: '[]', desc: 'Action objects (leaves) or group objects with `children`' },
			{ name: 'fields', type: 'Record<string, string>', desc: 'Remap data keys to component fields' },
			{ name: 'value', type: 'unknown', desc: 'Currently active value — highlights the matching item' },
			{ name: 'label', type: 'string', desc: 'Trigger button label' },
			{ name: 'icon', type: 'string', desc: 'Trigger button icon class' },
			{ name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", desc: 'Size variant — propagates as data-size' },
			{ name: 'align', type: "'start' | 'end'", default: "'start'", desc: 'Dropdown alignment relative to trigger' },
			{ name: 'direction', type: "'up' | 'down'", default: "'down'", desc: 'Dropdown expansion direction' },
			{ name: 'showArrow', type: 'boolean', default: 'true', desc: 'Show the chevron in the trigger' },
			{ name: 'collapsible', type: 'boolean', default: 'false', desc: 'Allow group headers to collapse children' },
			{ name: 'disabled', type: 'boolean', default: 'false', desc: 'Disable interaction' },
			{ name: 'class', type: 'string', default: "''", desc: 'Extra CSS classes' }
		],
		events: [
			{ name: 'onselect', signature: '(value, proxy) => void', desc: 'Fires when a leaf item is activated' }
		],
		attrs: [
			{ selector: '[data-menu]', desc: 'Root (carries data-size, data-align, data-direction, data-open)' },
			{ selector: '[data-menu-trigger]', desc: 'Trigger button' },
			{ selector: '[data-menu-dropdown]', desc: 'Dropdown container' },
			{ selector: '[data-menu-item]', desc: 'Leaf items (carries data-active, data-disabled)' },
			{ selector: '[data-menu-group]', desc: 'Group header' },
			{ selector: '[data-menu-separator]', desc: 'Visual separator' }
		]
	},
	snippets: [
		{
			id: 'intro',
			title: 'Basic — icons + onselect',
			lang: 'svelte',
			code: `<script>
  import { Menu } from '@rokkit/ui'

  const actions = [
    { label: 'Copy', icon: 'i-glyph:copy' },
    { label: 'Cut', icon: 'i-glyph:scissors' },
    { label: 'Paste', icon: 'i-glyph:clipboard' },
    { label: 'Delete', icon: 'i-glyph:trash-bin' }
  ]
</script>

<Menu items={actions} label="Actions" onselect={(v) => console.log(v)} />`
		},
		{
			id: 'groups',
			title: 'Grouped items',
			lang: 'svelte',
			code: `<Menu
  label="Menu"
  items={[
    { label: 'File', children: [
      { label: 'New', icon: 'i-glyph:add-circle' },
      { label: 'Open', icon: 'i-glyph:folder-open' }
    ] },
    { label: 'Edit', children: [
      { label: 'Undo', icon: 'i-glyph:restart' },
      { label: 'Copy', icon: 'i-glyph:copy' }
    ] }
  ]}
/>`
		},
		{
			id: 'alignment',
			title: 'End-aligned, up direction',
			lang: 'svelte',
			code: `<Menu items={actions} label="More" align="end" direction="up" />`
		}
	],
	docs
}

export default meta

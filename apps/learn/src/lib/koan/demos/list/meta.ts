import type { DemoMeta } from '../../types'
import docs from './docs.md?raw'
const meta: DemoMeta = {
	id: 'list',
	title: 'List with Groups',
	description:
		'Vertical list with collapsible groups (1–2 level shallow grouping). The right choice when groups are headings, not the focus.',
	keywords: [
		'list', 'lists', 'menu', 'sidebar', 'rail',
		'group', 'groups', 'collapsible', 'collapse',
		'expand', 'section', 'sections', 'category', 'categories'
	],
	category: 'navigation',
	icon: '列',
	load: () => import('./placeholder.svelte'),
	tool: {
		name: 'mount_list',
		description:
			'Mount a List on the canvas, optionally with collapsible groups. Use for shallow 1–2 level grouping where the items are the focus (settings menus, sidebar nav, command palettes). For deeper hierarchy prefer Tree.',
		parameters: {
			items: 'Array of items; group items have a `children` array',
			collapsible: 'boolean — enable expand/collapse on group headers',
			fields: 'optional { label, value } field mapping'
		}
	},
	inline: { capable: true },
	variants: [
		{ id: 'flat', label: 'Flat list (no groups)', mode: 'dynamic' },
		{ id: 'snippets', label: 'Custom item snippets', mode: 'dynamic' }
	],
	props: {
		size: {
			type: 'enum',
			options: ['sm', 'md', 'lg'],
			default: 'md',
			desc: 'Row density'
		}
	},
	api: {
		props: [
			{ name: 'items', type: 'any[]', default: '[]', desc: 'Array of items (objects or primitives)' },
			{ name: 'fields', type: 'FieldMapping', desc: 'Remap data keys to component fields' },
			{ name: 'value', type: 'any', default: 'null', desc: 'Currently selected item value', bindable: true },
			{ name: 'collapsible', type: 'boolean', default: 'false', desc: 'Allow groups to expand/collapse' },
			{ name: 'icons', type: 'Partial<IconMap>', desc: 'Override expand/collapse icons' },
			{ name: 'disabled', type: 'boolean', default: 'false', desc: 'Disable the entire list' },
			{ name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", desc: 'Row density' }
		],
		events: [
			{ name: 'onselect', signature: '(value, proxy) => void', desc: 'Fires when an item is selected — receives raw value + ProxyItem' }
		],
		attrs: [
			{ selector: '[data-list]', desc: 'Root container' },
			{ selector: '[data-list-item]', desc: 'Item wrapper (carries data-active, data-disabled)' },
			{ selector: '[data-list-group]', desc: 'Group header wrapper' },
			{ selector: '[data-list-group-content]', desc: 'Children container (collapsible)' }
		]
	},
	snippets: [
		{
			id: 'intro',
			title: 'Basic — array of objects',
			lang: 'svelte',
			code: `<script>
  import { List } from '@rokkit/ui'
  const items = [
    { label: 'Inbox',    icon: 'i-mdi:inbox', value: 'inbox' },
    { label: 'Starred',  icon: 'i-mdi:star',  value: 'starred' },
    { label: 'Archive',  icon: 'i-mdi:archive', value: 'archive' }
  ]
  let active = $state('inbox')
</script>

<List {items} bind:value={active} />`
		},
		{
			id: 'nested',
			title: 'Nested groups + collapsible',
			lang: 'svelte',
			code: `<List
  items={[
    { label: 'Mail', children: [
      { label: 'Inbox',    value: 'inbox' },
      { label: 'Drafts',   value: 'drafts' }
    ]},
    { label: 'Settings', children: [
      { label: 'Profile',  value: 'profile' },
      { label: 'Security', value: 'security' }
    ]}
  ]}
  collapsible
/>`
		},
		{
			id: 'mapping',
			title: 'Field mapping',
			lang: 'svelte',
			code: `<List
  items={routes}
  fields={{ label: 'name', value: 'path', icon: 'symbol' }}
/>`
		}
	],
	docs
}

export default meta

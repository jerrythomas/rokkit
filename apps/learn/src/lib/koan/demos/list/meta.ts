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
			{ selector: '[data-list]', desc: 'Root <nav> (carries data-size, data-collapsible)' },
			{ selector: '[data-list-item]', desc: 'Leaf item button/link (data-active, data-disabled, data-level)' },
			{ selector: '[data-list-group]', desc: 'Group header button (aria-expanded, data-level)' },
			{ selector: '[data-list-separator]', desc: 'Separator <hr>' },
			{ selector: '[data-item-label]', desc: 'Default-rendered label text' },
			{ selector: '[data-item-description]', desc: 'Default-rendered secondary line' },
			{ selector: '[data-item-badge]', desc: 'Default-rendered trailing badge' },
			{ selector: '[data-item-icon]', desc: 'Default-rendered icon (class or literal char/emoji)' }
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
		},
		{
			id: 'defaults',
			title: 'Icons, badges, descriptions — all data (no snippet)',
			lang: 'svelte',
			code: `<List items={[
  { label: 'Inbox',   icon: 'i-lucide:inbox', badge: '12' },
  { label: 'Starred', icon: '⭐', description: 'Flagged messages' },
  { label: 'Drafts',  icon: 'i-lucide:file', shortcut: '⌘D' }
]} bind:value />

<!-- icon takes a CSS icon class OR a literal char/emoji;
     badge, description, shortcut all render automatically. -->`
		},
		{
			id: 'named',
			title: 'Custom markup for one group + one item (Tier 2)',
			lang: 'svelte',
			code: `<script>
  const items = [
    { label: 'Observatory', snippet: 'header', children: [{ label: 'Telescopes' }] },
    { label: 'Settings', children: [{ label: 'General' }] }, // stays default
    { label: 'Pinned', snippet: 'pinned' }                   // custom leaf
  ]
</script>

<List {items} collapsible={false}>
  {#snippet header(proxy)}
    <span data-item-label>{proxy.label}</span>
    <span class="flex-1"></span>
    <button onclick={(e) => e.stopPropagation()}>Custom Toggle</button>
  {/snippet}
  {#snippet pinned(proxy)}
    <span class="i-lucide:pin"></span>
    <span>{proxy.label}</span>
  {/snippet}
</List>`
		},
		{
			id: 'theming',
			title: 'Theme via class (UnoCSS arbitrary variants)',
			lang: 'svelte',
			code: `<List {items} collapsible class="
  [&_[data-list-group]]:px-4
  [&_[data-list-item]]:py-1
  [&_[data-item-badge]]:text-xs [&_[data-item-badge]]:text-ink-mute
" />`
		}
	],
	docs
}

export default meta

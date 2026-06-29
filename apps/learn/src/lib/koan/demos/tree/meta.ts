import type { DemoMeta } from '../../types'
import docs from './docs.md?raw'
const meta: DemoMeta = {
	id: 'tree',
	title: 'Tree Select',
	description:
		'Hierarchical nested items with expand/collapse, keyboard navigation, and selection. Data-driven via children + field mapping.',
	keywords: [
		'tree', 'trees', 'hierarchy', 'hierarchical', 'nested', 'select',
		'folder', 'folders', 'files', 'navigation', 'nav', 'directory',
		'outline', 'parent', 'child', 'children'
	],
	category: 'navigation',
	icon: '枝',
	load: () => import('./placeholder.svelte'),
	tool: {
		name: 'mount_tree',
		description:
			'Mount a hierarchical Tree on the canvas. Use for multi-level nested data — file systems, org charts, navigation outlines, parent/child relationships.',
		parameters: {
			items: 'Array of nodes with optional `children` arrays',
			fields: 'optional { label, value } field mapping',
			value: 'optional initially-selected node id'
		}
	},
	inline: { capable: true },
	variants: [
		{ id: 'deep', label: 'Deeper nesting (5 levels)', mode: 'dynamic' },
		{ id: 'dotted-lines', label: 'Dotted indent lines', mode: 'dynamic', props: { lineStyle: 'dotted' } },
		{ id: 'no-lines', label: 'No indent lines', mode: 'dynamic', props: { lineStyle: 'none' } }
	],
	props: {
		lineStyle: {
			type: 'enum',
			options: ['solid', 'dashed', 'dotted', 'none'],
			default: 'solid',
			desc: 'Indent connector line style'
		},
		size: {
			type: 'enum',
			options: ['sm', 'md', 'lg'],
			default: 'md',
			desc: 'Row density'
		}
	},
	api: {
		props: [
			{ name: 'items', type: 'any[]', default: '[]', desc: 'Nested array of node objects' },
			{ name: 'fields', type: 'FieldMapping', desc: 'Remap data keys to component fields (label / value / children / icon)' },
			{ name: 'value', type: 'any', default: 'null', desc: 'Currently selected node value', bindable: true },
			{ name: 'lineStyle', type: "'solid' | 'dashed' | 'dotted' | 'none'", default: "'solid'", desc: 'Indent connector line style' },
			{ name: 'icons', type: 'Partial<IconMap>', desc: 'Override expand/collapse icons' },
			{ name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", desc: 'Row density' },
			{ name: 'class', type: 'string', default: "''", desc: 'Additional CSS class names' }
		],
		events: [
			{ name: 'onselect', signature: '(value, proxy) => void', desc: 'Fires when a node is selected — receives raw value + ProxyItem' }
		],
		attrs: [
			{ selector: '[data-tree-root]', desc: 'Root container' },
			{ selector: '[data-tree-item]', desc: 'Node wrapper' },
			{ selector: '[data-tree-item-content]', desc: 'Node label + icon row (carries data-active)' },
			{ selector: '[data-tree-connector]', desc: 'Indent guide line' }
		]
	},
	snippets: [
		{
			id: 'intro',
			title: 'Basic — nested children',
			lang: 'svelte',
			code: `<script>
  import { Tree } from '@rokkit/ui'
  const items = [
    { label: 'Documents', children: [
      { label: 'Resume.pdf', value: 'doc-resume' },
      { label: 'Cover-letter.pdf', value: 'doc-cover' }
    ]},
    { label: 'Music', children: [
      { label: 'Bach', value: 'm-bach' },
      { label: 'Glass', value: 'm-glass' }
    ]}
  ]
  let selected = $state(null)
</script>

<Tree {items} bind:value={selected} />`
		},
		{
			id: 'mapping',
			title: 'Field mapping',
			lang: 'svelte',
			code: `<Tree
  items={users}
  fields={{ label: 'name', value: 'id', children: 'reports' }}
/>`
		},
		{
			id: 'icons',
			title: 'Custom expand/collapse icons',
			lang: 'svelte',
			code: `<Tree
  {items}
  icons={{ expanded: 'i-mdi:folder-open', collapsed: 'i-mdi:folder' }}
  lineStyle="dotted"
/>`
		},
		{
			id: 'defaults',
			title: 'Icons and badges — all data (no snippet)',
			lang: 'svelte',
			code: `<Tree items={[
  { label: 'src', icon: 'i-lucide:folder', children: [
    { label: 'index.ts',  value: 'index',  icon: 'i-lucide:file-code', badge: 'main' },
    { label: 'utils.ts',  value: 'utils',  icon: 'i-lucide:file-code' },
    { label: 'pinned.ts', value: 'pinned', icon: 'i-lucide:file-code', badge: '★' }
  ]},
  { label: 'README.md', value: 'readme', icon: 'i-lucide:file-text' }
]} bind:value />

<!-- icon takes a CSS icon class OR a literal char/emoji;
     badge renders automatically on leaf nodes.
     description is NOT shown by default — use itemContent for that. -->`
		},
		{
			id: 'named',
			title: 'Custom markup for one node (Tier 2)',
			lang: 'svelte',
			code: `<script>
  const items = [
    { label: 'src', icon: 'i-lucide:folder', children: [
      { label: 'index.ts',  value: 'index',  icon: 'i-lucide:file-code' },
      { label: 'pinned.ts', value: 'pinned', icon: 'i-lucide:file-code', snippet: 'pinned' }
    ]},
    { label: 'README.md', value: 'readme', icon: 'i-lucide:file-text' } // stays default
  ]
</script>

<Tree {items} bind:value>
  {#snippet pinned(proxy)}
    <span class="i-lucide:pin"></span>
    <span>{proxy.label}</span>
  {/snippet}
</Tree>`
		},
		{
			id: 'theming',
			title: 'Theme via class (UnoCSS arbitrary variants)',
			lang: 'svelte',
			code: `<Tree {items} bind:value class="
  [&_[data-tree-node]]:px-2
  [&_[data-tree-item-content][data-active]]:bg-accent-soft
  [&_[data-item-badge]]:text-xs [&_[data-item-badge]]:text-ink-mute
" />`
		}
	],
	docs
}

export default meta

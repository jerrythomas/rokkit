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
		}
	],
	docs
}

export default meta

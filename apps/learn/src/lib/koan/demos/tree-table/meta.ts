import type { DemoMeta } from '../../types'
import docs from './docs.md?raw'

const meta: DemoMeta = {
	id: 'tree-table',
	title: 'Tree Table',
	description:
		'Hierarchical rows in a sortable grid. One column owns the chevron + indent; sort applies per-sibling so parents and children stay attached.',
	keywords: [
		'tree-table',
		'tree table',
		'treegrid',
		'hierarchical table',
		'nested rows',
		'grouped table',
		'rollup',
		'drilldown',
		'expand collapse',
		'sortable hierarchy',
		'nestByPath',
		'nestByColumns'
	],
	category: 'data',
	icon: '⮽',
	load: () => import('./placeholder.svelte'),
	tool: {
		name: 'mount_tree_table',
		description:
			'Mount a hierarchical sortable table on the canvas. Use when the user wants nested rows, drilldowns, rolled-up groups, or a treegrid where children sort within their parent.',
		parameters: {
			data: 'Array<Record<string, unknown>> — nested rows; each row may carry children: []',
			caption: 'optional caption text'
		}
	},
	inline: { capable: true },
	api: {
		props: [
			{
				name: 'data',
				type: 'Array<Record<string, unknown>>',
				default: '[]',
				desc: 'Nested rows — each row may carry a children: [] array'
			},
			{
				name: 'columns',
				type: 'TreeTableColumn[]',
				desc: 'Optional column definitions; auto-derived from the first row when omitted. Set column.hierarchy = true to pick the chevron column (defaults to the first column)'
			},
			{
				name: 'value',
				type: 'any',
				default: 'null',
				desc: 'Currently selected row value',
				bindable: true
			},
			{
				name: 'selectable',
				type: "'single' | 'multi' | false",
				default: "'single'",
				desc: 'Selection mode'
			},
			{
				name: 'caption',
				type: 'string',
				desc: 'Caption text (also sets aria-label)'
			},
			{
				name: 'size',
				type: "'sm' | 'md' | 'lg'",
				default: "'md'",
				desc: 'Row density'
			},
			{
				name: 'striped',
				type: 'boolean',
				default: 'false',
				desc: 'Alternate row background tone'
			},
			{
				name: 'lineStyle',
				type: "'none' | 'solid' | 'dashed' | 'dotted'",
				default: "'solid'",
				desc: 'Tree connector line style'
			}
		],
		events: [
			{
				name: 'onselect',
				signature: '(value, row) => void',
				desc: 'Fires when a row is selected (click or Enter)'
			},
			{
				name: 'onsort',
				signature: '(sortState) => void',
				desc: 'Fires when sort state changes'
			}
		],
		attrs: [
			{ selector: '[data-tree-table]', desc: 'Root container' },
			{
				selector: '[data-tree-table-row]',
				desc: 'Body row — carries data-tree-level, data-selected, aria-expanded'
			},
			{
				selector: '[data-table-cell][data-hierarchy="true"]',
				desc: 'The hierarchy cell — contains the chevron + connector prefix'
			},
			{
				selector: '[data-tree-table-toggle]',
				desc: 'Expand/collapse chevron button'
			}
		]
	},
	snippets: [
		{
			id: 'intro',
			title: 'Basic — nested rows',
			lang: 'svelte',
			code: `<script>
  import { TreeTable } from '@rokkit/ui'

  const data = [
    {
      region: 'EMEA',
      sales: 1840,
      children: [
        { region: 'France', sales: 540 },
        { region: 'Germany', sales: 920 }
      ]
    },
    {
      region: 'AMER',
      sales: 2640,
      children: [
        { region: 'USA', sales: 1820 },
        { region: 'Canada', sales: 820 }
      ]
    }
  ]
</script>

<TreeTable {data} />`
		},
		{
			id: 'nest-by-path',
			title: 'From a path-string flat list',
			lang: 'svelte',
			code: `<script>
  import { TreeTable } from '@rokkit/ui'
  import { nestByPath } from '@rokkit/data'

  const flat = [
    { path: 'engineering', headcount: 24 },
    { path: 'engineering/web', headcount: 11 },
    { path: 'engineering/web/frontend', headcount: 7 }
  ]
  const data = nestByPath(flat, { column: 'path' })
</script>

<TreeTable {data} />`
		},
		{
			id: 'nest-by-columns',
			title: 'Group flat rows by columns',
			lang: 'svelte',
			code: `<script>
  import { TreeTable } from '@rokkit/ui'
  import { nestByColumns } from '@rokkit/data'

  const flat = [
    { region: 'EMEA', country: 'France', revenue: 320 },
    { region: 'EMEA', country: 'Germany', revenue: 280 },
    { region: 'AMER', country: 'USA', revenue: 480 }
  ]
  const data = nestByColumns(flat, ['region', 'country'])
</script>

<TreeTable {data} />`
		}
	],
	docs
}

export default meta

import type { DemoMeta } from '../../types'
import { tableDocs } from './docs'

const meta: DemoMeta = {
	id: 'table',
	title: 'Sortable Table',
	description:
		'Tabular data with click-to-sort columns. Shift-click for multi-column sort. Pure data-driven — columns inferred from rows.',
	keywords: [
		'table', 'tables', 'data', 'sortable', 'sort', 'rows', 'columns',
		'grid', 'tabular', 'spreadsheet', 'list', 'records', 'dataset'
	],
	category: 'data',
	icon: '表',
	load: () => import('./placeholder.svelte'),
	tool: {
		name: 'mount_table',
		description:
			'Mount a sortable Table on the canvas. Use when the user wants to display tabular data, sortable columns, a spreadsheet-like grid, or a sortable list of records.',
		parameters: {
			data: 'Array<Record<string, unknown>> — rows; columns are inferred from the first row',
			caption: 'optional caption text'
		}
	},
	inline: { capable: true },
	variants: [
		{ id: 'mapping', label: 'Custom field mapping', mode: 'dynamic' },
		{ id: 'sticky-header', label: 'Sticky header on scroll', mode: 'dynamic' },
		{ id: 'striped', label: 'Striped rows', mode: 'dynamic', props: { striped: true } }
	],
	props: {
		striped: {
			type: 'boolean',
			default: false,
			desc: 'Alternate row background tone for scan-readability'
		}
	},
	api: {
		props: [
			{ name: 'data', type: 'Array<Record<string, unknown>>', default: '[]', desc: 'Rows to display' },
			{ name: 'columns', type: 'ColumnDef[]', desc: 'Optional column definitions; auto-derived from data keys when omitted' },
			{ name: 'value', type: 'any', default: 'null', desc: 'Currently selected row value', bindable: true },
			{ name: 'caption', type: 'string', desc: 'Caption text (also sets aria-label)' },
			{ name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", desc: 'Row density' },
			{ name: 'striped', type: 'boolean', default: 'false', desc: 'Alternate row background tone' },
			{ name: 'disabled', type: 'boolean', default: 'false', desc: 'Disable all interaction' }
		],
		events: [
			{ name: 'onselect', signature: '(row) => void', desc: 'Fires when a row is selected (click or Enter)' },
			{ name: 'onsort', signature: '(sortState) => void', desc: 'Fires when sort state changes' }
		],
		attrs: [
			{ selector: '[data-table-root]', desc: 'Root <table> container' },
			{ selector: '[data-table-row]', desc: 'Body row (carries data-selected)' },
			{ selector: '[data-table-cell]', desc: 'Body cell' },
			{ selector: '[data-table-header]', desc: 'Header cell (click to sort)' }
		]
	},
	snippets: [
		{
			id: 'intro',
			title: 'Basic — auto-derived columns',
			lang: 'svelte',
			code: `<script>
  import { Table } from '@rokkit/ui'
  const rows = [
    { id: 1, name: 'Ada',    role: 'Engineer' },
    { id: 2, name: 'Linus',  role: 'Engineer' },
    { id: 3, name: 'Grace',  role: 'Admiral'  }
  ]
  let selected = $state(null)
</script>

<Table data={rows} bind:value={selected} />`
		},
		{
			id: 'custom-columns',
			title: 'Custom columns + formatter',
			lang: 'svelte',
			code: `<script>
  import { Table } from '@rokkit/ui'
  const columns = [
    { key: 'name',   label: 'Name',   width: '200px' },
    { key: 'salary', label: 'Salary', align: 'right',
      formatter: (v) => '$' + v.toLocaleString() },
    { key: 'role',   label: 'Role', sortable: false }
  ]
</script>

<Table {data} {columns} />`
		},
		{
			id: 'filtering',
			title: 'Compose with SearchFilter',
			lang: 'svelte',
			code: `<script>
  import { Table, SearchFilter } from '@rokkit/ui'
  let filtered = $state(rows)
</script>

<SearchFilter source={rows} bind:filtered />
<Table data={filtered} {columns} />`
		}
	],
	docs: tableDocs
}

export default meta

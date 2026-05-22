import type { DemoMeta } from '../../types'

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
	load: () => import('./placeholder.svelte')
}

export default meta

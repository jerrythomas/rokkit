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
	}
}

export default meta

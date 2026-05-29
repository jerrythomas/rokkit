import type { DemoMeta } from '../../types'

const meta: DemoMeta = {
	id: 'chart',
	title: 'Bar Chart',
	description:
		'Data-driven chart with field-mapped axes. Pass rows + x/y fields and the SVG is built for you — palette colors, gridlines, hover tooltips out of the box.',
	keywords: [
		'chart', 'charts', 'graph', 'graphs', 'bar', 'plot', 'plots',
		'visualization', 'viz', 'analytics', 'data', 'metrics',
		'revenue', 'sales', 'series', 'svg'
	],
	category: 'data',
	icon: '図',
	load: () => import('./placeholder.svelte'),
	tool: {
		name: 'mount_bar_chart',
		description:
			'Mount a BarChart on the canvas. Use when the user wants a data visualization — sales by quarter, counts by category, distributions, anything categorical → numeric.',
		parameters: {
			data: 'Array of rows',
			x: 'field name for the x-axis (categorical)',
			y: 'field name for the y-axis (numeric)',
			fill: 'optional field name for color grouping',
			stack: 'optional boolean — stack bars by color group',
			stat: 'optional aggregation: sum | mean | count | …'
		}
	},
	inline: { capable: true },
	variants: [
		{ id: 'grouped', label: 'Grouped by product', mode: 'dynamic', props: { fill: 'product', legend: true } },
		{ id: 'stacked', label: 'Stacked', mode: 'dynamic', props: { fill: 'product', stack: true, legend: true } },
		{ id: 'with-labels', label: 'With data labels', mode: 'dynamic', props: { label: true } }
	],
	props: {
		stack: {
			type: 'boolean',
			default: false,
			desc: 'Stack bars by color group instead of grouping side-by-side'
		},
		legend: {
			type: 'boolean',
			default: false,
			desc: 'Show the color-group legend'
		},
		label: {
			type: 'boolean',
			default: false,
			desc: 'Render value labels on top of each bar'
		}
	}
}

export default meta

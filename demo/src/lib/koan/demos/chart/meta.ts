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
	load: () => import('./placeholder.svelte')
}

export default meta

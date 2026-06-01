import type { DemoMeta } from '../../types'
import { chartDocs } from './docs'

const meta: DemoMeta = {
	id: 'chart',
	title: 'Charts',
	description:
		'Nine field-mapped chart components — bars, lines, areas, pies, scatter, bubble, box, violin, sparkline. Pass rows + field names, get an SVG.',
	keywords: [
		'chart', 'charts', 'graph', 'graphs', 'plot', 'plots',
		'visualization', 'viz', 'analytics', 'data', 'metrics', 'svg',
		'bar', 'bar-chart', 'line', 'line-chart', 'area', 'area-chart',
		'pie', 'pie-chart', 'scatter', 'scatter-plot', 'bubble', 'bubble-chart',
		'box', 'box-plot', 'violin', 'violin-plot', 'sparkline', 'spark-line',
		'trends', 'distribution', 'kpi', 'inline-chart'
	],
	category: 'data',
	icon: '図',
	load: () => import('./index.svelte'),
	tool: {
		name: 'mount_charts',
		description:
			'Mount the Charts gallery on the canvas — shows the nine chart shapes from @rokkit/chart side by side.',
		parameters: {}
	},
	inline: { capable: true },
	variants: [],
	api: {
		props: [
			{ name: 'data', type: 'Array<Record<string, unknown>>', default: '[]', desc: 'Row array — same shape across every chart' },
			{ name: 'x', type: 'string', desc: 'Field name for the x-axis (Bar / Line / Area / Scatter / Bubble / Box / Violin)' },
			{ name: 'y', type: 'string', desc: 'Field name for the y-axis (and the slice value on Pie)' },
			{ name: 'fill', type: 'string', desc: 'Colour-group field on Bar / Area / Box / Violin / Pie' },
			{ name: 'color', type: 'string', desc: 'Colour-group field on Line / Scatter / Bubble' },
			{ name: 'size', type: 'string', desc: 'Bubble-radius field on BubbleChart (and optional on ScatterPlot)' },
			{ name: 'stat', type: "'identity' | 'sum' | 'mean' | 'count' | 'min' | 'max'", default: 'varies', desc: 'Aggregation when rows share an x; default `identity` (Bar/Line/Area) or `sum` (Pie)' },
			{ name: 'stack', type: 'boolean', default: 'false', desc: 'Stack grouped series instead of side-by-side (Bar / Area)' },
			{ name: 'legend', type: 'boolean', default: 'false', desc: 'Render the colour-group legend' },
			{ name: 'grid', type: 'boolean', default: 'true', desc: 'Background gridlines (Cartesian charts only)' },
			{ name: 'tooltip', type: 'boolean', default: 'false', desc: 'Hover tooltip with the underlying row' },
			{ name: 'innerRadius', type: 'number', default: '0', desc: 'Pie inner radius — set non-zero for a donut' },
			{ name: 'width', type: 'number', default: '600', desc: 'SVG width (400 for Pie; smaller for Sparkline)' },
			{ name: 'height', type: 'number', default: '400', desc: 'SVG height' }
		],
		events: [
			{ name: 'onhover', signature: '(row) => void', desc: 'Fires when the pointer enters a data point (Cartesian charts with tooltip enabled)' }
		],
		attrs: [
			{ selector: '[data-chart]', desc: 'Root SVG container' },
			{ selector: '[data-bar]', desc: 'Bar mark (carries data-fill, data-group)' },
			{ selector: '[data-line]', desc: 'Line / Area mark' },
			{ selector: '[data-arc]', desc: 'Pie slice' },
			{ selector: '[data-point]', desc: 'Scatter / Bubble dot' },
			{ selector: '[data-axis]', desc: 'Axis group' },
			{ selector: '[data-legend]', desc: 'Colour-group legend' }
		]
	},
	snippets: [
		{
			id: 'bar',
			title: 'BarChart',
			lang: 'svelte',
			code: `<script>
  import { BarChart } from '@rokkit/chart'
  const data = [
    { quarter: 'Q1', revenue: 120 },
    { quarter: 'Q2', revenue: 180 },
    { quarter: 'Q3', revenue: 160 },
    { quarter: 'Q4', revenue: 210 }
  ]
</script>

<BarChart {data} x="quarter" y="revenue" />`
		},
		{
			id: 'line',
			title: 'LineChart',
			lang: 'svelte',
			code: `<LineChart {data} x="month" y="revenue" color="product" legend />`
		},
		{
			id: 'area',
			title: 'AreaChart',
			lang: 'svelte',
			code: `<AreaChart {data} x="month" y="revenue" fill="product" stack legend />`
		},
		{
			id: 'pie',
			title: 'PieChart',
			lang: 'svelte',
			code: `<PieChart {data} y="share" fill="segment" innerRadius={60} legend />`
		},
		{
			id: 'scatter',
			title: 'ScatterPlot',
			lang: 'svelte',
			code: `<ScatterPlot {data} x="displ" y="hwy" color="class" legend />`
		},
		{
			id: 'bubble',
			title: 'BubbleChart',
			lang: 'svelte',
			code: `<BubbleChart {data} x="cty" y="hwy" size="displ" color="class" legend />`
		},
		{
			id: 'box',
			title: 'BoxPlot',
			lang: 'svelte',
			code: `<BoxPlot {data} x="class" y="hwy" fill="drv" legend />`
		},
		{
			id: 'violin',
			title: 'ViolinPlot',
			lang: 'svelte',
			code: `<ViolinPlot {data} x="class" y="hwy" fill="drv" legend />`
		},
		{
			id: 'sparkline',
			title: 'Sparkline',
			lang: 'svelte',
			code: `<Sparkline data={[12, 45, 23, 67, 34, 89, 56, 72, 41, 90]} type="area" width={120} height={32} />`
		}
	],
	docs: chartDocs
}

export default meta

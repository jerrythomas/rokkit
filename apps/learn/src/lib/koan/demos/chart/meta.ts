import type { DemoMeta } from '../../types'
import docs from './docs.md?raw'
const meta: DemoMeta = {
	id: 'chart',
	title: 'Charts',
	description:
		'Interactive chart explorer — bar, line, area, pie, radar, scatter, bubble, quadrant, box, violin, heatmap, hexbin, contour, candlestick, waterfall, ribbon, rule, region and hull, plus Architecture recipes over metrics measured from this repo: Robert Martin’s main sequence, hotspots, complexity × coverage, fan-in × fan-out and god modules. Tweak orientation, position, colour, pattern, hulls, contours and opacity live, with guided suggestions.',
	keywords: [
		'chart',
		'charts',
		'plot',
		'plots',
		'visualization',
		'viz',
		'analytics',
		'data',
		'metrics',
		'svg',
		'bar',
		'bar-chart',
		'line',
		'line-chart',
		'area',
		'area-chart',
		'pie',
		'pie-chart',
		'scatter',
		'scatter-plot',
		'bubble',
		'bubble-chart',
		'box',
		'box-plot',
		'violin',
		'violin-plot',
		'trends',
		'distribution',
		'kpi',
		'region',
		'hull',
		'contour',
		'density',
		'abline',
		'reference-line',
		'architecture',
		'main-sequence',
		'instability',
		'abstractness',
		'zone-of-pain',
		'hotspots',
		'churn',
		'complexity',
		'coverage',
		'coupling',
		'fan-in',
		'fan-out',
		'code-smells',
		'god-module',
		'codebase-analysis'
	],
	category: 'data',
	icon: '図',
	load: () => import('./index.svelte'),
	tool: {
		name: 'mount_charts',
		description:
			'Mount the interactive chart explorer on the canvas — the user picks a chart type and tweaks its settings live. Pass `type` to open a specific chart (e.g. "violin", "bar").',
		parameters: {
			type: 'optional chart type to open: bar | line | area | pie | scatter | bubble | quadrant | box | violin | heatmap | hexbin | contour | candlestick | waterfall | ribbon | radar | rule | region | hull | facet | animated | main-sequence | hotspots | coverage | coupling | smells (defaults to bar)'
		}
	},
	inline: { capable: true },
	variants: [],
	api: {
		props: [
			{
				name: 'data',
				type: 'Array<Record<string, unknown>>',
				default: '[]',
				desc: 'Row array — same shape across every chart'
			},
			{
				name: 'x',
				type: 'string',
				desc: 'Field name for the x-axis (Bar / Line / Area / Scatter / Bubble / Box / Violin)'
			},
			{ name: 'y', type: 'string', desc: 'Field name for the y-axis (and the slice value on Pie)' },
			{
				name: 'fill',
				type: 'string',
				desc: 'Colour-group field on Bar / Area / Box / Violin / Pie'
			},
			{ name: 'color', type: 'string', desc: 'Colour-group field on Line / Scatter / Bubble' },
			{
				name: 'size',
				type: 'string',
				desc: 'Bubble-radius field on BubbleChart (and optional on ScatterPlot)'
			},
			{
				name: 'stat',
				type: "'identity' | 'sum' | 'mean' | 'count' | 'min' | 'max'",
				default: 'varies',
				desc: 'Aggregation when rows share an x; default `identity` (Bar/Line/Area) or `sum` (Pie)'
			},
			{
				name: 'stack',
				type: 'boolean',
				default: 'false',
				desc: 'Stack grouped series instead of side-by-side (Bar / Area)'
			},
			{ name: 'legend', type: 'boolean', default: 'false', desc: 'Render the colour-group legend' },
			{
				name: 'grid',
				type: "boolean | 'x' | 'y' | 'both'",
				default: 'true',
				desc: "Background gridlines. true = auto (horizontal always; vertical only for band scales); 'both'/'x' force vertical lines on continuous scales at x-tick positions; 'y' = horizontal only; false = none"
			},
			{
				name: 'highlight',
				type: "'first' | 'last' | 'min' | 'max' | number | (row, i) => boolean",
				desc: 'Mark a specific observation with an accent dot (predicate matches many). PlotChart / AreaChart / LineChart'
			},
			{
				name: 'trend',
				type: 'method | method[]',
				desc: 'Overlay trend/reference lines. Constants avg/median/min/max/value → horizontal line; fits linear/ma/ema/exp → series. Dashed by default'
			},
			{
				name: 'onselect',
				type: '(detail) => void',
				desc: 'Fires when an observation is clicked/activated; detail = { datum, index, series, value, x, y, geom, event } — drill or act on it. All cartesian geoms'
			},
			{
				name: 'selectable',
				type: 'boolean',
				default: 'false',
				desc: 'Opt-in click-to-highlight: clicking toggles a multi-selection rendered via the Highlight overlay'
			},
			{
				name: 'selected',
				type: 'Row[] (bindable)',
				desc: 'Bindable selected rows (bind:selected); PlotState is the source of truth'
			},
			{
				name: 'tooltip',
				type: 'boolean',
				default: 'false',
				desc: 'Hover tooltip with the underlying row'
			},
			{
				name: 'innerRadius',
				type: 'number',
				default: '0',
				desc: 'Donut hole — a value ≤1 is a fraction of the radius, >1 is pixels'
			},
			{
				name: 'width',
				type: 'number',
				default: '600',
				desc: 'SVG width (400 for Pie; smaller for Sparkline)'
			},
			{ name: 'height', type: 'number', default: '400', desc: 'SVG height' }
		],
		events: [
			{
				name: 'onhover',
				signature: '(row) => void',
				desc: 'Fires when the pointer enters a data point (Cartesian charts with tooltip enabled)'
			},
			{
				name: 'onselect',
				signature: '(detail) => void',
				desc: 'Observation clicked/activated; detail = { datum, index, series, value, x, y, geom, event }'
			}
		],
		attrs: [
			{ selector: '[data-chart]', desc: 'Root SVG container' },
			{ selector: '[data-bar]', desc: 'Bar mark (carries data-fill, data-group)' },
			{ selector: '[data-line]', desc: 'Line / Area mark' },
			{ selector: '[data-arc]', desc: 'Pie slice' },
			{ selector: '[data-point]', desc: 'Scatter / Bubble dot' },
			{ selector: '[data-axis]', desc: 'Axis group' },
			{ selector: '[data-legend]', desc: 'Colour-group legend' },
			{
				selector: '[data-plot-grid-line="x"|"y"]',
				desc: 'Grid line, per orientation — theme via --chart-grid-{color,width,dash,opacity}'
			},
			{
				selector: '[data-plot-trend]',
				desc: 'Trend/reference line (data-plot-trend="<method>") — theme via --chart-trend-{color,width,dash,opacity}'
			},
			{
				selector: '[data-plot-highlight]',
				desc: 'Highlighted observation marker — theme via --chart-highlight-{color,radius,ring}'
			},
			{
				selector: '[data-plot-selected="true"]',
				desc: 'A selected (clicked) observation marker — theme via --chart-selected-{ring,ring-width,fill}'
			},
			{
				selector: '[data-plot-rule="x"|"y"|"slope"]',
				desc: 'Reference line kind — slope is the abline (slope + intercept), clipped to the visible domain'
			},
			{
				selector: '[data-plot-geom="region"][data-plot-region]',
				desc: 'A shaded region in data coordinates; data-plot-region carries its name — theme via --chart-region-{fill,opacity,label-color,label-size,label-opacity}'
			},
			{
				selector: '[data-plot-hull]',
				desc: 'One group’s convex hull (value = the group) — padded by a round-joined stroke; --chart-hull-label-{color,size}'
			},
			{
				selector: '[data-plot-contour][data-plot-contour-level]',
				desc: 'A density contour ring/band per group and level (0 = outermost) — --chart-contour-{color,width,opacity}'
			}
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
			id: 'main-sequence',
			title: 'Main sequence (Martin)',
			lang: 'svelte',
			code: `<script>
  import { PlotChart, Plot } from '@rokkit/chart'
  // one row per component: instability I = Ce/(Ca+Ce), abstractness A
  let { components } = $props()
  const pain = [[0, 0], [0.5, 0], [0, 0.5]]
  const useless = [[1, 1], [0.5, 1], [1, 0.5]]
</script>

<PlotChart data={components} xDomain={[0, 1]} yDomain={[0, 1]} legend tooltip>
  <Plot.Region name="pain" points={pain} label="Zone of pain" />
  <Plot.Region name="uselessness" points={useless} label="Zone of uselessness" />
  <Plot.Hull x="instability" y="abstractness" color="package" />
  <Plot.Rule slope={-1} intercept={1} label="main sequence" />
  <Plot.Point x="instability" y="abstractness" color="package" size="loc" />
</PlotChart>`
		},
		{
			id: 'hotspots',
			title: 'Hotspots — an open-ended Region',
			lang: 'svelte',
			code: `<PlotChart data={modules} tooltip>
  <!-- null runs to the edge: "p95 and beyond" -->
  <Plot.Region x={[p95.complexity, null]} y={[p95.churn, null]} label="Hotspots" />
  <Plot.Contour x="complexity" y="churn" bandwidth={24} />
  <Plot.Point x="complexity" y="churn" color="package" size="loc" />
</PlotChart>`
		},
		{
			id: 'sparkline',
			title: 'Sparkline',
			lang: 'svelte',
			code: `<Sparkline data={[12, -8, 23, -17, 34, 56, -9, 41]} type="bar" baseline={0} highlight={['min', 'max', 'last']} trend="linear" width={140} height={36} />`
		}
	],
	docs
}

export default meta

import type { DemoMeta } from '../../types'
import docs from './docs.md?raw'

const meta: DemoMeta = {
	id: 'sparkline',
	title: 'Sparkline',
	description:
		'An interactive Sparkline explorer — a word-sized inline chart for table cells and KPIs. Switch between line, bar and area and toggle a zero baseline, min/max/last markers and a trend line, live.',
	keywords: [
		'sparkline',
		'spark-line',
		'inline-chart',
		'micro-chart',
		'mini-chart',
		'trendline',
		'trend',
		'baseline',
		'kpi',
		'table-cell',
		'inline'
	],
	category: 'data',
	icon: '∿',
	load: () => import('./index.svelte'),
	tool: {
		name: 'mount_sparkline',
		description:
			'Mount the interactive Sparkline explorer on the canvas — the user toggles type, baseline, highlight markers and a trend line live. Pass `type` to open a specific shape.',
		parameters: {
			type: 'optional sparkline type to open: line | bar | area (defaults to line)'
		}
	},
	inline: { capable: true },
	variants: [],
	api: {
		props: [
			{ name: 'data', type: 'number[] | Record<string, unknown>[]', desc: 'The series — bare numbers, or object rows with `field`.' },
			{ name: 'field', type: 'string', desc: 'Field name when `data` is object rows.' },
			{ name: 'type', type: "'line' | 'bar' | 'area'", default: "'line'", desc: 'Spark shape.' },
			{ name: 'baseline', type: 'number', desc: 'Reference rule at this value (e.g. 0). Bars auto-anchor to 0 when the series has negatives.' },
			{ name: 'highlight', type: "'first' | 'last' | 'min' | 'max' | number | (…)[]", desc: 'Mark notable points.' },
			{ name: 'trend', type: "'avg' | 'linear' | 'median' | number | (…)[]", desc: 'Overlay a trend / reference line.' },
			{ name: 'curve', type: "'linear' | 'smooth'", default: "'linear'", desc: 'Line / area interpolation.' },
			{ name: 'color', type: 'string', default: "'primary'", desc: 'Palette role for stroke / fill.' },
			{ name: 'pattern', type: 'string', desc: 'Texture-fill key.' },
			{ name: 'width', type: 'number', default: '80', desc: 'SVG width (px).' },
			{ name: 'height', type: 'number', default: '24', desc: 'SVG height (px).' }
		],
		attrs: [
			{ selector: '[data-sparkline-demo]', desc: 'The demo canvas wrapper (e2e hook).' },
			{ selector: '[data-plot-baseline]', desc: 'The baseline reference rule.' },
			{ selector: '[data-plot-highlight]', desc: 'A highlighted point marker.' },
			{ selector: '[data-plot-trend]', desc: 'A trend / reference line (value = method).' },
			{ selector: '[data-plot-geom="trend|highlight"]', desc: 'Mark-group wrappers.' }
		]
	},
	docs
}

export default meta

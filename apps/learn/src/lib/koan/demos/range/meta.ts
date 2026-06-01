import type { DemoMeta } from '../../types'
import docs from './docs.md?raw'
const meta: DemoMeta = {
	id: 'range',
	title: 'Range',
	description: 'Slider input — single value or dual-thumb range, with optional tick marks and labels.',
	keywords: ['range', 'slider', 'numeric', 'input', 'thumb', 'dual', 'min-max', 'volume'],
	category: 'forms',
	icon: '幅',
	load: () => import('./index.svelte'),
	inline: { capable: true },
	variants: [],
	api: {
		props: [
			{ name: 'value', type: 'number', default: '50', desc: 'Single-thumb value', bindable: true },
			{ name: 'lower', type: 'number', default: '0', desc: 'Lower bound in range mode', bindable: true },
			{ name: 'upper', type: 'number', default: '100', desc: 'Upper bound in range mode', bindable: true },
			{ name: 'min', type: 'number', default: '0', desc: 'Minimum allowed value' },
			{ name: 'max', type: 'number', default: '100', desc: 'Maximum allowed value' },
			{ name: 'step', type: 'number', default: '1', desc: 'Step granularity' },
			{ name: 'range', type: 'boolean', default: 'false', desc: 'Dual-thumb mode (lower + upper)' },
			{ name: 'ticks', type: 'number', default: '0', desc: 'Number of evenly-spaced tick marks' },
			{ name: 'labelSkip', type: 'number', default: '0', desc: 'Skip N labels between visible ones' },
			{ name: 'disabled', type: 'boolean', default: 'false', desc: 'Disable interaction' }
		],
		events: [
			{ name: 'onchange', signature: '(value) => void', desc: 'Fires on each value change' }
		],
		attrs: [
			{ selector: '[data-range]', desc: 'Root container' },
			{ selector: '[data-range-track]', desc: 'Track element' },
			{ selector: '[data-range-thumb]', desc: 'Thumb (one or two)' }
		]
	},
	snippets: [
		{ id: 'intro', title: 'Single value', lang: 'svelte', code: `<Range bind:value min={0} max={100} />` },
		{ id: 'ticks', title: 'With ticks', lang: 'svelte',
			code: `<Range bind:value min={0} max={100} step={10} ticks={11} />` },
		{ id: 'range', title: 'Range mode', lang: 'svelte',
			code: `<Range range bind:lower bind:upper min={0} max={100} />` }
	],
	docs
}

export default meta

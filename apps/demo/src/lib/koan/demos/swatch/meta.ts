import type { DemoMeta } from '../../types'
import { swatchDocs } from './docs'

const meta: DemoMeta = {
	id: 'swatch',
	title: 'Swatch',
	description: 'Visual single- or multi-select where each option is a filled colour tile.',
	keywords: ['swatch', 'swatches', 'color', 'palette', 'picker', 'tile', 'visual-select'],
	category: 'forms',
	icon: '色',
	load: () => import('./index.svelte'),
	tool: {
		name: 'mount_swatch',
		description: 'Mount a Swatch gallery — single, multi-select, sizes.',
		parameters: { options: 'array of colour strings or objects' }
	},
	inline: { capable: true },
	variants: [],
	api: {
		props: [
			{ name: 'options', type: 'any[]', default: '[]', desc: 'Colour strings or object items with `value`/`label`' },
			{ name: 'fields', type: 'FieldMapping', desc: 'Remap data keys (label, value)' },
			{ name: 'value', type: 'any | any[]', desc: 'Currently selected value(s)', bindable: true },
			{ name: 'multiple', type: 'boolean', default: 'false', desc: 'Multi-select mode (value is array)' },
			{ name: 'shape', type: "'square' | 'circle'", default: "'square'", desc: 'Tile shape' },
			{ name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", desc: 'Tile size' },
			{ name: 'disabled', type: 'boolean', default: 'false', desc: 'Disable interaction' },
			{ name: 'class', type: 'string', default: "''", desc: 'Extra CSS classes' }
		],
		events: [
			{ name: 'onchange', signature: '(value, proxy) => void', desc: 'Fires on selection change' }
		],
		attrs: [
			{ selector: '[data-swatch]', desc: 'Root container (carries data-shape, data-size)' },
			{ selector: '[data-swatch-option]', desc: 'Individual tile (carries data-selected, data-disabled)' }
		]
	},
	snippets: [
		{ id: 'single', title: 'Single-select', lang: 'svelte',
			code: `<Swatch options={['#0ea5e9', '#f97316', '#10b981']} bind:value />` },
		{ id: 'multi', title: 'Multi-select circles', lang: 'svelte',
			code: `<Swatch options={colours} bind:value multiple shape="circle" />` }
	],
	docs: swatchDocs
}

export default meta

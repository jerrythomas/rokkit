import type { DemoMeta } from '../../types'
import { switchDocs } from './docs'

const meta: DemoMeta = {
	id: 'switch',
	title: 'Switch',
	description: 'Binary on/off pill switch — iOS-style toggle for preferences and feature flags.',
	keywords: ['switch', 'toggle', 'binary', 'on-off', 'pill', 'preference', 'flag', 'boolean'],
	category: 'forms',
	icon: '切',
	load: () => import('./index.svelte'),
	inline: { capable: true },
	variants: [],
	api: {
		props: [
			{ name: 'value', type: 'any', desc: 'Current value (matches one of the options)', bindable: true },
			{ name: 'options', type: '[off, on]', default: '[false, true]', desc: 'Two-element array defining the off/on states' },
			{ name: 'fields', type: 'FieldMapping', desc: 'Remap data keys for option objects' },
			{ name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", desc: 'Track size' },
			{ name: 'showLabels', type: 'boolean', default: 'false', desc: 'Render option labels next to the track' },
			{ name: 'disabled', type: 'boolean', default: 'false', desc: 'Disable interaction' }
		],
		events: [
			{ name: 'onchange', signature: '(value, item) => void', desc: 'Fires on toggle change' }
		],
		attrs: [
			{ selector: '[data-switch]', desc: 'Root container (carries aria-checked, data-size)' },
			{ selector: '[data-switch-track]', desc: 'Track element' },
			{ selector: '[data-switch-thumb]', desc: 'Thumb element' }
		]
	},
	snippets: [
		{ id: 'intro', title: 'Basic', lang: 'svelte', code: `<Switch bind:value />` },
		{ id: 'labels', title: 'With labels', lang: 'svelte',
			code: `<Switch bind:value showLabels\n  options={[{ label: 'Off', value: false }, { label: 'On', value: true }]} />` }
	],
	docs: switchDocs
}

export default meta

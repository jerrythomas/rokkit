import type { DemoMeta } from '../../types'

const meta: DemoMeta = {
	id: 'theme-wizard',
	title: 'Theme Builder',
	description:
		'Compose a Rokkit theme: skin, density, mode, and roundedness. Save & download.',
	keywords: [
		'theme', 'themes', 'customize', 'style', 'skin', 'palette',
		'color', 'colors', 'dark', 'light', 'density', 'mode', 'design'
	],
	category: 'theme',
	icon: '染',
	load: () => import('./index.svelte'),
	tool: {
		name: 'mount_theme_wizard',
		description:
			'Mount the interactive theme wizard. Use when the user wants to customize the look — pick palettes, set role-step mappings, save a preset, export tokens.css. The wizard reskins the running app live as the user picks.',
		parameters: {
			palette: 'optional initial accent palette hint (shu | slate | neutral | warm-gray)',
			step: 'optional initial accent step (50, 100, …, 950)'
		}
	},
	// Theme wizard isn't inline-capable — the role table + live reskin needs
	// the full canvas width to read well.
	inline: { capable: false },
	variants: [
		{ id: 'tokens-preview', label: 'Show generated tokens.css', mode: 'dynamic' },
		{ id: 'dark-only', label: 'Dark mode column only', mode: 'dynamic' }
	],
	api: {
		props: [
			{ name: 'palette', type: "'shu' | 'slate' | 'neutral' | 'warm-gray' | string", desc: 'Active accent palette' },
			{ name: 'step', type: '50 | 100 | 200 | … | 950', default: '500', desc: 'Active accent step' },
			{ name: 'mode', type: "'light' | 'dark'", default: "'light'", desc: 'Current mode column being edited' },
			{ name: 'density', type: "'compact' | 'comfortable' | 'spacious'", default: "'comfortable'", desc: 'UI density preset' },
			{ name: 'roundedness', type: "'square' | 'soft' | 'round'", default: "'soft'", desc: 'Corner radius preset' }
		],
		events: [
			{ name: 'onsave', signature: '(preset) => void', desc: 'Fires when the user saves a theme preset' },
			{ name: 'onexport', signature: '(css: string) => void', desc: 'Fires when the user exports tokens.css' }
		],
		attrs: [
			{ selector: '[data-theme-wizard]', desc: 'Root container' },
			{ selector: '[data-wizard-step]', desc: 'Step card (01 Style / 02 Skin / 03 Typography / 04 Preview)' },
			{ selector: '[data-role-row]', desc: 'Per-role palette+step picker row' }
		]
	},
	snippets: [
		{
			id: 'save-preset',
			title: 'Save the wizard’s output to localStorage',
			lang: 'js',
			code: `import {
  savePreset,
  exportTokensCss
} from '$lib/koan/demos/theme-wizard/store.svelte'

// Persist the current role-step map under the named preset
savePreset('my-brand')

// Generate the tokens.css string for the active selection
const css = exportTokensCss()
console.log(css)`
		},
		{
			id: 'apply-preset',
			title: 'Apply a saved preset at runtime',
			lang: 'ts',
			code: `import { vibe } from '@rokkit/states'

vibe.setSkin('my-brand')   // skin
vibe.setStyle('zen-sumi')  // style theme
vibe.setMode('dark')       // light | dark
vibe.setDensity('compact')`
		}
	]
}

export default meta

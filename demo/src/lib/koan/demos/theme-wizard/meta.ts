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
	]
}

export default meta

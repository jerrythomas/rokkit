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
	load: () => import('./index.svelte')
}

export default meta

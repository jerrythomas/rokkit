import type { DemoMeta } from '../../types'

const meta: DemoMeta = {
	id: 'tabs',
	title: 'Tabs',
	description: 'Tabbed panels — horizontal, vertical, pill, and underlined orientations.',
	keywords: ['tabs', 'tab', 'tabbed', 'panels', 'sections', 'orientation', 'vertical', 'horizontal', 'switch'],
	category: 'navigation',
	icon: '章',
	load: () => import('./index.svelte')
}

export default meta

import type { DemoMeta } from '../../types'

const meta: DemoMeta = {
	id: 'tabs',
	title: 'Tabs',
	description: 'Tabbed panels — horizontal, vertical, pill, and underlined orientations.',
	keywords: ['tabs', 'tab', 'tabbed', 'panels', 'sections', 'orientation', 'vertical', 'horizontal', 'switch'],
	category: 'navigation',
	icon: '章',
	load: () => import('./index.svelte'),
	tool: {
		name: 'mount_tabs',
		description:
			'Mount a Tabs component on the canvas. Use when the user asks for tabbed navigation, switchable panels, or content split across labeled views.',
		parameters: {
			items: 'Array<{ label: string, content?: string }> — at least 2 items',
			value: 'optional initially-active tab label'
		}
	},
	inline: { capable: true },
	variants: [
		{ id: 'vertical', label: 'Vertical orientation', mode: 'dynamic', props: { orientation: 'vertical' } },
		{ id: 'with-icons', label: 'With icons', mode: 'dynamic' }
	]
}

export default meta

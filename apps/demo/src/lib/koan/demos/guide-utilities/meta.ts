import type { DemoMeta } from '../../types'
import { guideContent } from './content'

const meta: DemoMeta = {
	id: 'guide-utilities',
	title: 'Utilities',
	description: 'Controllers + navigator pattern — build your own accessible components on the same primitives.',
	keywords: [
		'utilities', 'controllers', 'navigator', 'pattern',
		'list-controller', 'nested-controller', 'proxy-item', 'icons'
	],
	category: 'guide',
	icon: '具',
	load: () => import('./index.svelte'),
	inline: { capable: false },
	variants: [],
	snippets: [],
	docs: guideContent
}

export default meta

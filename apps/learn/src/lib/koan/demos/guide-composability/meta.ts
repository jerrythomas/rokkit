import type { DemoMeta } from '../../types'
import { guideContent } from './content'

const meta: DemoMeta = {
	id: 'guide-composability',
	title: 'Composability',
	description: 'Customise any component via Svelte 5 snippet slots — no forking, no CSS overrides.',
	keywords: [
		'composability', 'snippets', 'slots', 'customization',
		'itemContent', 'groupContent', 'per-item-snippet', 'render-props'
	],
	category: 'guide',
	icon: '組',
	load: () => import('./index.svelte'),
	inline: { capable: false },
	variants: [],
	snippets: [],
	docs: guideContent
}

export default meta

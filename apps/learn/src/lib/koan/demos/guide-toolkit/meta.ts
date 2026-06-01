import type { DemoMeta } from '../../types'
import { guideContent } from './content'

const meta: DemoMeta = {
	id: 'guide-toolkit',
	title: 'Toolkit',
	description: 'Companion packages — states, data, actions, core, blocks, themes — usable standalone.',
	keywords: [
		'toolkit', 'packages', 'states', 'data', 'actions',
		'core', 'blocks', 'themes', 'standalone'
	],
	category: 'guide',
	icon: '匣',
	load: () => import('./index.svelte'),
	inline: { capable: false },
	variants: [],
	snippets: [],
	docs: guideContent
}

export default meta

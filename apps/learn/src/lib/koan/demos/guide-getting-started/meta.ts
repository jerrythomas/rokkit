import type { DemoMeta } from '../../types'
import { guideContent } from './content'

const meta: DemoMeta = {
	id: 'guide-getting-started',
	title: 'Getting Started',
	description: 'Install Rokkit, set up the theme, and mount your first data-driven component.',
	keywords: [
		'getting-started', 'intro', 'introduction', 'install',
		'setup', 'first-component', 'rokkit-basics', 'tutorial'
	],
	category: 'guide',
	icon: '始',
	load: () => import('./index.svelte'),
	inline: { capable: false },
	variants: [],
	snippets: [],
	docs: guideContent
}

export default meta

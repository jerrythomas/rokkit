import type { DemoMeta } from '../../types'
import { guideContent } from './content'

const meta: DemoMeta = {
	id: 'guide-theming',
	title: 'Theming & Design',
	description: 'Skins, styles, modes, and the data-attribute-driven approach to visual customisation.',
	keywords: [
		'theming', 'theme', 'design', 'skin', 'style', 'mode',
		'dark-mode', 'palette', 'tokens', 'colors', 'data-style'
	],
	category: 'guide',
	icon: '彩',
	load: () => import('./index.svelte'),
	inline: { capable: false },
	variants: [],
	snippets: [],
	docs: guideContent
}

export default meta

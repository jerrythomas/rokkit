import type { DemoMeta } from '../../types'
import { guideContent } from './content'

const meta: DemoMeta = {
	id: 'guide-accessibility',
	title: 'Accessibility & i18n',
	description: 'Keyboard nav, ARIA semantics, focus management, screen-reader labels, and localisation.',
	keywords: [
		'accessibility', 'a11y', 'aria', 'keyboard', 'focus',
		'screen-reader', 'i18n', 'localisation', 'navigator', 'controller'
	],
	category: 'guide',
	icon: '助',
	load: () => import('./index.svelte'),
	inline: { capable: false },
	variants: [],
	snippets: [],
	docs: guideContent
}

export default meta

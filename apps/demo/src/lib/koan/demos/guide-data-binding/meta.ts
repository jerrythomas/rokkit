import type { DemoMeta } from '../../types'
import { guideContent } from './content'

const meta: DemoMeta = {
	id: 'guide-data-binding',
	title: 'Data Binding',
	description: 'How Rokkit maps any data shape to components via the `fields` prop — no adapters.',
	keywords: [
		'data-binding', 'fields', 'field-mapping', 'data-shape',
		'adapter', 'bindable', 'value', 'items', 'data-first'
	],
	category: 'guide',
	icon: '繋',
	load: () => import('./index.svelte'),
	inline: { capable: false },
	variants: [],
	snippets: [],
	docs: guideContent
}

export default meta

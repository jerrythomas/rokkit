import type { DemoMeta } from '../../types'
import { guideContent } from './content'

const meta: DemoMeta = {
	id: 'guide-forms',
	title: 'Forms Guide',
	description: 'Schema-driven forms with validation, dependent lookups, dirty tracking, and custom renderers.',
	keywords: [
		'forms', 'schema', 'validation', 'json-schema', 'lookups',
		'dependent-fields', 'form-builder', 'custom-renderers'
	],
	category: 'guide',
	icon: '式',
	load: () => import('./index.svelte'),
	inline: { capable: false },
	variants: [],
	snippets: [],
	docs: guideContent
}

export default meta

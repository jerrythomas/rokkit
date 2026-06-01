import type { DemoMeta } from '../../types'
import { guideContent } from './content'

const meta: DemoMeta = {
	id: 'guide-toolchain',
	title: 'Toolchain',
	description: 'CLI: init, doctor, upgrade, skin, theme — plus build integrations + icon collections.',
	keywords: [
		'toolchain', 'cli', 'init', 'doctor', 'upgrade',
		'skin', 'theme', 'scaffolding', 'icons', 'unocss'
	],
	category: 'guide',
	icon: '工',
	load: () => import('./index.svelte'),
	inline: { capable: false },
	variants: [],
	snippets: [],
	docs: guideContent
}

export default meta

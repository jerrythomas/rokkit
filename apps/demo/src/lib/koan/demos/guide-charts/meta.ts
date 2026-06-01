import type { DemoMeta } from '../../types'
import { guideContent } from './content'

const meta: DemoMeta = {
	id: 'guide-charts',
	title: 'Charts Guide',
	description: 'The chart family — 9 prebuilt shapes plus <Plot> for custom encodings, facets, and crossfilter.',
	keywords: [
		'charts', 'plot', 'svg', 'visualization', 'geoms',
		'facets', 'crossfilter', 'animated-plot', 'chart-family'
	],
	category: 'guide',
	icon: '視',
	load: () => import('./index.svelte'),
	inline: { capable: false },
	variants: [],
	snippets: [],
	docs: guideContent
}

export default meta

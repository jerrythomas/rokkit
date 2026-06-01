import type { DemoMeta } from '../../types'
import { ratingDocs } from './docs'

const meta: DemoMeta = {
	id: 'rating',
	title: 'Rating',
	description: 'Discrete N-of-max picker — stars by default, any icon via the icons prop.',
	keywords: ['rating', 'stars', 'review', 'score', 'feedback', 'hearts'],
	category: 'forms',
	icon: '評',
	load: () => import('./index.svelte'),
	inline: { capable: true },
	variants: [],
	api: {
		props: [
			{ name: 'value', type: 'number', default: '0', desc: 'Current rating', bindable: true },
			{ name: 'max', type: 'number', default: '5', desc: 'Number of icons to render' },
			{ name: 'disabled', type: 'boolean', default: 'false', desc: 'Disable interaction (read-only display)' },
			{ name: 'label', type: 'string', desc: 'aria-label for the rating group' },
			{ name: 'icons', type: '{ filled?: string; empty?: string }', desc: 'Override default star icons' },
			{ name: 'class', type: 'string', default: "''", desc: 'Extra CSS classes' }
		],
		events: [
			{ name: 'onchange', signature: '(value) => void', desc: 'Fires on rating change' }
		],
		attrs: [
			{ selector: '[data-rating]', desc: 'Root container (carries data-value, data-max)' },
			{ selector: '[data-rating-icon]', desc: 'Individual icon (carries data-filled)' }
		]
	},
	snippets: [
		{ id: 'intro', title: 'Stars', lang: 'svelte', code: `<Rating bind:value max={5} />` },
		{ id: 'hearts', title: 'Hearts', lang: 'svelte',
			code: `<Rating bind:value max={10}\n  icons={{ filled: 'i-mdi:heart', empty: 'i-mdi:heart-outline' }} />` }
	],
	docs: ratingDocs
}

export default meta

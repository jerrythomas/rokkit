import type { DemoMeta } from '../../types'

const meta: DemoMeta = {
	id: 'combo',
	title: 'Combobox',
	description:
		'Filterable Select — type to narrow the options. The same Select component with the `filterable` flag flipped.',
	keywords: [
		'combo', 'combobox', 'autocomplete', 'auto-complete', 'auto complete',
		'typeahead', 'type-ahead', 'filter', 'filterable', 'search',
		'searchable', 'narrow', 'country', 'countries'
	],
	category: 'forms',
	icon: '探',
	load: () => import('./placeholder.svelte'),
	tool: {
		name: 'mount_combobox',
		description:
			'Mount a filterable Select (combobox / autocomplete). Use when the option count is large enough that typing beats scrolling — countries, users, products, etc. For short fixed lists prefer mount_select.',
		parameters: {
			items: 'Array<{ label, value }> options (typically 15+)',
			value: 'optional pre-selected value',
			placeholder: 'optional trigger placeholder text'
		}
	},
	inline: { capable: true }
}

export default meta

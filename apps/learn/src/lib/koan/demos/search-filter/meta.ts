import type { DemoMeta } from '../../types'
import docs from './docs.md?raw'
const meta: DemoMeta = {
	id: 'search-filter',
	title: 'SearchFilter',
	description: 'Free-text search input that parses queries into structured filter objects (column / operator / value).',
	keywords: [
		'search', 'filter', 'query', 'parser', 'column-filter',
		'operator', 'regex', 'data-filter', 'search-bar'
	],
	category: 'data',
	icon: '尋',
	load: () => import('./index.svelte'),
	tool: {
		name: 'mount_search_filter',
		description: 'Mount a SearchFilter input on the canvas.',
		parameters: { placeholder: 'string', debounce: 'milliseconds' }
	},
	inline: { capable: true },
	variants: [],
	api: {
		props: [
			{ name: 'filters', type: 'FilterObject[]', default: '[]', desc: 'Parsed filter array — emitted as the user types', bindable: true },
			{ name: 'placeholder', type: 'string', default: "'Search...'", desc: 'Input placeholder' },
			{ name: 'debounce', type: 'number', default: '300', desc: 'Debounce in ms (0 → synchronous)' },
			{ name: 'columns', type: 'string[]', desc: 'Suggest column names for autocomplete (informational only — does not gate which queries parse)' },
			{ name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", desc: 'Size variant' },
			{ name: 'labels', type: 'Record<string, string>', desc: 'Override the clear / remove labels (i18n)' },
			{ name: 'class', type: 'string', default: "''", desc: 'Extra CSS classes' }
		],
		events: [
			{ name: 'onfilter', signature: '(filters: FilterObject[]) => void', desc: 'Fires whenever the parsed filter set changes' }
		],
		attrs: [
			{ selector: '[data-search-filter]', desc: 'Root (carries data-size)' },
			{ selector: '[data-search-input]', desc: 'The native search input' },
			{ selector: '[data-search-clear]', desc: 'Clear-all button (visible when input has content)' },
			{ selector: '[data-search-tag]', desc: 'Parsed-filter chip with remove handler' }
		]
	},
	snippets: [
		{
			id: 'intro',
			title: 'Basic — bound filters',
			lang: 'svelte',
			code: `<script>
  import { SearchFilter } from '@rokkit/ui'
  let filters = $state([])
</script>

<SearchFilter bind:filters placeholder="Search products..." />`
		},
		{
			id: 'callback',
			title: 'With onfilter callback',
			lang: 'svelte',
			code: `<SearchFilter
  bind:filters
  onfilter={(list) => console.log(list.length, 'filters')}
  debounce={150}
/>`
		}
	],
	docs
}

export default meta

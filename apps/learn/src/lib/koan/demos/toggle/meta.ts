import type { DemoMeta } from '../../types'
import docs from './docs.md?raw'
const meta: DemoMeta = {
	id: 'toggle',
	title: 'Toggle',
	description: 'Segmented control — N mutually-exclusive options visible all at once. Counterpart to Select dropdown.',
	keywords: ['toggle', 'segmented', 'control', 'button-group', 'options', 'switcher', 'tabs-like'],
	category: 'forms',
	icon: '段',
	load: () => import('./index.svelte'),
	inline: { capable: true },
	variants: [],
	api: {
		props: [
			{ name: 'options', type: 'any[]', default: '[]', desc: 'Array of strings or objects with label/value/icon' },
			{ name: 'fields', type: 'FieldMapping', desc: 'Remap data keys (label, value, icon)' },
			{ name: 'value', type: 'any', desc: 'Currently selected option value', bindable: true },
			{ name: 'variant', type: "'group' | 'button'", default: "'group'", desc: 'Segmented group vs cycle-button' },
			{ name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", desc: 'Control density' },
			{ name: 'showLabels', type: 'boolean', default: 'true', desc: 'Render text labels (off → icons only)' },
			{ name: 'disabled', type: 'boolean', default: 'false', desc: 'Disable interaction' },
			{ name: 'label', type: 'string', desc: 'aria-label for the radiogroup' }
		],
		events: [
			{ name: 'onchange', signature: '(value, item) => void', desc: 'Fires on selection change' }
		],
		attrs: [
			{ selector: '[data-toggle]', desc: 'Root container (carries data-variant, data-size, data-toggle-labels)' },
			{ selector: '[data-toggle-option]', desc: 'Individual option (carries data-selected, data-disabled)' },
			{ selector: '[data-toggle-icon]', desc: 'Icon span inside an option' },
			{ selector: '[data-toggle-label]', desc: 'Label text inside an option' }
		]
	},
	snippets: [
		{ id: 'intro', title: 'Segmented group', lang: 'svelte',
			code: `<Toggle\n  options={[\n    { label: 'List', value: 'list' },\n    { label: 'Grid', value: 'grid' }\n  ]}\n  bind:value\n/>` },
		{ id: 'icons', title: 'With icons', lang: 'svelte',
			code: `<Toggle\n  options={[\n    { label: 'Left',  value: 'left',  icon: 'i-mdi:format-align-left' },\n    { label: 'Right', value: 'right', icon: 'i-mdi:format-align-right' }\n  ]}\n  bind:value\n/>` },
		{
			id: 'defaults',
			title: 'Icons and labels are data (no snippet)',
			lang: 'svelte',
			code: `<Toggle options={[
  { label: 'Day',   value: 'day',   icon: 'i-lucide:sun' },
  { label: 'Week',  value: 'week',  icon: 'i-lucide:calendar' },
  { label: 'Month', value: 'month', icon: 'i-lucide:calendar-range' }
]} bind:value />

<!-- icon takes a CSS icon class; label renders as text.
     No snippet needed — both are data. -->`
		},
		{
			id: 'named',
			title: 'Custom markup for one option (Tier 2)',
			lang: 'svelte',
			code: `<script>
  const options = [
    { label: 'Edit',   value: 'edit',  icon: 'i-lucide:pen' },
    { label: 'Pinned', value: 'pin',   snippet: 'pinned' },  // custom; others stay default
    { label: 'View',   value: 'view',  icon: 'i-lucide:eye' }
  ]
</script>

<Toggle {options} bind:value>
  {#snippet pinned(proxy, selected)}
    <span class="i-lucide:pin"></span>
    <strong class:font-bold={selected}>{proxy.label}</strong>
  {/snippet}
</Toggle>`
		},
		{
			id: 'theming',
			title: 'Theme via class (UnoCSS arbitrary variants)',
			lang: 'svelte',
			code: `<Toggle {options} bind:value class="
  [&_[data-toggle-option]]:px-4
  [&_[data-toggle-option][data-selected]]:font-semibold
  [&_[data-toggle-label]]:text-sm
" />`
		}
	],
	docs
}

export default meta

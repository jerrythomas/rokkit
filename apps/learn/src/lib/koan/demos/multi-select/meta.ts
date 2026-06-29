import type { DemoMeta } from '../../types'
import docs from './docs.md?raw'
const meta: DemoMeta = {
	id: 'multi-select',
	title: 'Multi-Select',
	description:
		'Pick many values from a dropdown. Selected items render as chips inside the trigger; click a chip to remove.',
	keywords: [
		'multi', 'multi-select', 'multiselect', 'multiple', 'select',
		'pick', 'choose', 'chips', 'chip', 'tags', 'tag', 'options',
		'checkbox', 'checkboxes', 'combo'
	],
	category: 'forms',
	icon: '選',
	load: () => import('./placeholder.svelte'),
	tool: {
		name: 'mount_multi_select',
		description:
			'Mount a MultiSelect on the canvas. Use when the user needs to pick multiple values from a list — tags, multi-pick filters, role assignment.',
		parameters: {
			items: 'Array<{ label, value }> options',
			value: 'optional array of pre-selected values',
			placeholder: 'optional trigger placeholder text'
		}
	},
	inline: { capable: true },
	variants: [
		{ id: 'with-counts', label: 'With selection count', mode: 'dynamic' },
		{ id: 'no-overflow', label: 'No chip overflow', mode: 'dynamic' }
	],
	api: {
		props: [
			{ name: 'items', type: 'any[]', default: '[]', desc: 'Options — objects or grouped option arrays' },
			{ name: 'fields', type: 'FieldMapping', desc: 'Remap data keys to component fields' },
			{ name: 'value', type: 'any[]', default: '[]', desc: 'Array of selected values', bindable: true },
			{ name: 'selected', type: 'any[]', default: '[]', desc: 'Array of selected raw item objects', bindable: true },
			{ name: 'placeholder', type: 'string', default: "'Select…'", desc: 'Trigger placeholder when nothing is selected' },
			{ name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", desc: 'Trigger + option density' },
			{ name: 'maxDisplay', type: 'number', default: '3', desc: 'Max chips shown in the trigger before the +N badge' },
			{ name: 'align', type: "'start' | 'end'", default: "'start'", desc: 'Dropdown horizontal alignment' },
			{ name: 'direction', type: "'down' | 'up'", default: "'down'", desc: 'Dropdown open direction' },
			{ name: 'disabled', type: 'boolean', default: 'false', desc: 'Disable the entire multi-select' }
		],
		events: [
			{ name: 'onchange', signature: '(values, items) => void', desc: 'Fires on selection change — receives values + raw item objects' }
		],
		attrs: [
			{ selector: '[data-multi-select]', desc: 'Root container' },
			{ selector: '[data-trigger]', desc: 'Trigger button (carries chips)' },
			{ selector: '[data-chip]', desc: 'Individual selection chip' },
			{ selector: '[data-dropdown]', desc: 'Options dropdown panel' }
		]
	},
	snippets: [
		{
			id: 'intro',
			title: 'Basic — array of values',
			lang: 'svelte',
			code: `<script>
  import { MultiSelect } from '@rokkit/ui'
  const items = [
    { label: 'Red',   value: 'r' },
    { label: 'Green', value: 'g' },
    { label: 'Blue',  value: 'b' }
  ]
  let selected = $state(['r', 'g'])
</script>

<MultiSelect {items} bind:value={selected} placeholder="Pick colors" />`
		},
		{
			id: 'fields',
			title: 'Field mapping',
			lang: 'svelte',
			code: `<MultiSelect
  items={users}
  fields={{ label: 'name', value: 'id' }}
  bind:value={selectedIds}
/>`
		},
		{
			id: 'grouped',
			title: 'Grouped options',
			lang: 'svelte',
			code: `<MultiSelect
  items={[
    { label: 'Fruits', children: [
      { label: 'Apple',  value: 'a' },
      { label: 'Banana', value: 'b' }
    ]},
    { label: 'Vegetables', children: [
      { label: 'Carrot', value: 'c' },
      { label: 'Dill',   value: 'd' }
    ]}
  ]}
  bind:value
  maxDisplay={2}
/>`
		},
		{
			id: 'defaults',
			title: 'Icons, badges, descriptions — all data (no snippet)',
			lang: 'svelte',
			code: `<MultiSelect items={[
  { label: 'Frontend', icon: 'i-lucide:monitor', value: 'frontend' },
  { label: 'Backend',  icon: 'i-lucide:server',  value: 'backend',  badge: 'New' },
  { label: 'Design',   icon: '🎨',               value: 'design',   description: 'UI/UX tasks', shortcut: '⌘D' }
]} bind:value />

<!-- icon takes a CSS icon class OR a literal char/emoji;
     badge, description, shortcut all render automatically in the dropdown.
     Selected items always appear as removable chips in the trigger. -->`
		},
		{
			id: 'named',
			title: 'Custom markup for one group + one option (Tier 2)',
			lang: 'svelte',
			code: `<script>
  const items = [
    { label: 'Stacks', snippet: 'header', children: [
      { label: 'Svelte',  value: 'svelte',  snippet: 'featured', icon: 'i-logos:svelte-icon' },
      { label: 'React',   value: 'react',   icon: 'i-logos:react' }  // stays default
    ]},
    { label: 'Languages', children: [
      { label: 'TypeScript', value: 'ts' }
    ]}                                                                // group stays default
  ]
</script>

<MultiSelect {items} bind:value>
  {#snippet header(proxy)}
    <span class="i-lucide:layers" aria-hidden="true"></span>
    <span>{proxy.label}</span>
  {/snippet}
  {#snippet featured(proxy)}
    <span class={proxy.icon} aria-hidden="true"></span>
    <span class="flex-1">{proxy.label}</span>
    <span data-item-badge>Featured</span>
  {/snippet}
</MultiSelect>`
		},
		{
			id: 'theming',
			title: 'Theme via class (UnoCSS arbitrary variants)',
			lang: 'svelte',
			code: `<MultiSelect {items} bind:value class="
  [&_[data-select-option][data-selected]]:font-semibold
  [&_[data-select-tag]]:rounded-full [&_[data-select-tag]]:bg-accent-soft
  [&_[data-item-badge]]:text-xs [&_[data-item-badge]]:text-ink-mute
  [&_[data-select-group-label]]:uppercase [&_[data-select-group-label]]:text-xs
" />`
		}
	],
	docs
}

export default meta

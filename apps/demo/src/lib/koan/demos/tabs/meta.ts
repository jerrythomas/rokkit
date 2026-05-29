import type { DemoMeta } from '../../types'

const meta: DemoMeta = {
	id: 'tabs',
	title: 'Tabs',
	description: 'Tabbed panels — horizontal, vertical, pill, and underlined orientations.',
	keywords: ['tabs', 'tab', 'tabbed', 'panels', 'sections', 'orientation', 'vertical', 'horizontal', 'switch'],
	category: 'navigation',
	icon: '章',
	load: () => import('./index.svelte'),
	tool: {
		name: 'mount_tabs',
		description:
			'Mount a Tabs component on the canvas. Use when the user asks for tabbed navigation, switchable panels, or content split across labeled views.',
		parameters: {
			items: 'Array<{ label: string, content?: string }> — at least 2 items',
			value: 'optional initially-active tab label'
		}
	},
	inline: { capable: true },
	variants: [
		{ id: 'vertical', label: 'Vertical orientation', mode: 'dynamic', props: { orientation: 'vertical' } },
		{ id: 'with-icons', label: 'With icons', mode: 'dynamic' }
	],
	props: {
		orientation: {
			type: 'enum',
			options: ['horizontal', 'vertical'],
			default: 'horizontal',
			desc: 'Layout axis for the tab strip'
		},
		position: {
			type: 'enum',
			options: ['before', 'after'],
			default: 'before',
			desc: 'Strip placement relative to the panel (top/left when before, bottom/right when after — depends on orientation)'
		},
		align: {
			type: 'enum',
			options: ['start', 'center', 'end'],
			default: 'start',
			desc: 'Alignment of tabs along the strip'
		}
	},
	api: {
		props: [
			{ name: 'items', type: 'any[]', default: '[]', desc: 'Tab items — strings or objects with label/value' },
			{ name: 'value', type: 'any', default: 'null', desc: 'Selected tab value', bindable: true },
			{ name: 'fields', type: 'FieldMapping', desc: 'Field mapping for label/value extraction from object items' },
			{ name: 'orientation', type: "'horizontal' | 'vertical'", default: "'horizontal'", desc: 'Layout axis of the tab strip' },
			{ name: 'position', type: "'before' | 'after'", default: "'before'", desc: 'Strip placement relative to the panel — `before` puts it top (horizontal) or left (vertical); `after` puts it bottom/right' },
			{ name: 'align', type: "'start' | 'center' | 'end'", default: "'start'", desc: 'Alignment of tabs within the strip' },
			{ name: 'editable', type: 'boolean', default: 'false', desc: 'Enable add/remove tab buttons' },
			{ name: 'placeholder', type: 'string', default: "'Select a tab…'", desc: 'Text shown when no tab is selected' },
			{ name: 'name', type: 'string', default: "'tabs'", desc: 'aria-label for the tab strip' },
			{ name: 'class', type: 'string', default: "''", desc: 'Additional CSS class names' }
		],
		events: [
			{ name: 'onselect', signature: '({ value, selected }) => void', desc: 'Fires when a tab is selected' },
			{ name: 'onchange', signature: '({ value, selected }) => void', desc: 'Fires when the selected tab changes' },
			{ name: 'onmove', signature: '({ value, selected }) => void', desc: 'Fires when focus moves between tabs' },
			{ name: 'onadd', signature: '() => void', desc: 'Fires when add button is clicked (editable mode)' },
			{ name: 'onremove', signature: '(item) => void', desc: 'Fires when a tab is removed (editable mode)' }
		],
		attrs: [
			{ selector: '[data-tab-root]', desc: 'Root container (carries orientation/position/align)' },
			{ selector: '[data-tab-list]', desc: 'Tab strip container' },
			{ selector: '[data-tab-item]', desc: 'Individual tab button' },
			{ selector: '[data-tab-content]', desc: 'Panel content container' },
			{ selector: '[data-tab-add]', desc: 'Add-tab button (editable mode)' },
			{ selector: '[data-tab-remove]', desc: 'Remove-tab button (editable mode)' }
		]
	},
	snippets: [
		{
			id: 'intro',
			title: 'Basic — string items',
			lang: 'svelte',
			code: `<script>
  import { Tabs } from '@rokkit/ui'
  let active = $state('Overview')
  const items = ['Overview', 'Details', 'Settings']
</script>

<Tabs {items} bind:value={active} />`
		},
		{
			id: 'objects',
			title: 'Object items + field mapping',
			lang: 'svelte',
			code: `<script>
  import { Tabs } from '@rokkit/ui'
  const items = [
    { id: 'a', title: 'Overview', body: 'Welcome' },
    { id: 'b', title: 'Details',  body: 'Specs go here' }
  ]
  let active = $state('a')
</script>

<Tabs
  {items}
  bind:value={active}
  fields={{ label: 'title', value: 'id' }}
/>`
		},
		{
			id: 'configuration',
			title: 'Layout — orientation + position + align',
			lang: 'svelte',
			code: `<Tabs
  items={['One', 'Two', 'Three']}
  orientation="vertical"
  position="left"
  align="start"
/>`
		},
		{
			id: 'editable',
			title: 'Editable — add / remove',
			lang: 'svelte',
			code: `<script>
  import { Tabs } from '@rokkit/ui'
  let items = $state([{ label: 'Untitled' }])
  let active = $state('Untitled')
</script>

<Tabs
  bind:items
  bind:value={active}
  editable
  onadd={() => (items = [...items, { label: 'New tab' }])}
  onremove={(t) => (items = items.filter((i) => i !== t))}
/>`
		}
	]
}

export default meta

import type { DemoMeta } from '../../types'
import { toolbarDocs } from './docs'

const meta: DemoMeta = {
	id: 'toolbar',
	title: 'Toolbar',
	description: 'WAI-ARIA toolbar — grouped action buttons with arrow-key nav, separators, and spacers.',
	keywords: [
		'toolbar', 'tool-bar', 'actions', 'editor-chrome', 'formatting',
		'icon-bar', 'controls', 'rich-text'
	],
	category: 'navigation',
	icon: '具',
	load: () => import('./index.svelte'),
	tool: {
		name: 'mount_toolbar',
		description: 'Mount a Toolbar gallery on the canvas.',
		parameters: { items: 'array of toolbar items (label + icon, separator, spacer)' }
	},
	inline: { capable: true },
	variants: [],
	api: {
		props: [
			{ name: 'items', type: 'ToolbarItem[]', default: '[]', desc: 'Action items with `label`/`icon`, plus optional `{ itemType: "separator" | "spacer" }`' },
			{ name: 'fields', type: 'Record<string, string>', desc: 'Remap data keys to component fields' },
			{ name: 'position', type: "'top' | 'bottom' | 'left' | 'right'", default: "'top'", desc: 'Which edge the toolbar sits at — left/right gives a vertical bar' },
			{ name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", desc: 'Button size variant' },
			{ name: 'width', type: "'auto' | 'full'", default: "'full'", desc: 'Stretch to the container or hug content' },
			{ name: 'sticky', type: 'boolean', default: 'false', desc: 'Stick to its position edge' },
			{ name: 'compact', type: 'boolean', default: 'false', desc: 'Tighter padding for dense editor chrome' },
			{ name: 'showDividers', type: 'boolean', default: 'true', desc: 'Render visual dividers between groups' },
			{ name: 'disabled', type: 'boolean', default: 'false', desc: 'Disable all items' },
			{ name: 'class', type: 'string', default: "''", desc: 'Extra CSS classes' }
		],
		events: [
			{ name: 'onclick', signature: '(item) => void', desc: 'Fires when an interactive item is activated' }
		],
		attrs: [
			{ selector: '[data-toolbar]', desc: 'Root container (carries data-position, data-size, data-compact)' },
			{ selector: '[data-toolbar-item]', desc: 'Interactive button (carries data-active, data-disabled)' },
			{ selector: '[data-toolbar-separator]', desc: 'Visual divider between groups' },
			{ selector: '[data-toolbar-spacer]', desc: 'Flex spacer pushing later items to the opposite end' }
		]
	},
	snippets: [
		{
			id: 'intro',
			title: 'Basic — formatting toolbar',
			lang: 'svelte',
			code: `<script>
  import { Toolbar } from '@rokkit/ui'

  const items = [
    { label: 'Bold', icon: 'i-glyph:text-bold' },
    { label: 'Italic', icon: 'i-glyph:text-italic' },
    { label: 'Underline', icon: 'i-glyph:text-underline' },
    { itemType: 'separator' },
    { label: 'Align Left', icon: 'i-glyph:align-left' },
    { label: 'Align Center', icon: 'i-glyph:align-center' },
    { label: 'Align Right', icon: 'i-glyph:align-right' }
  ]
</script>

<Toolbar {items} onclick={(item) => console.log(item.label)} />`
		},
		{
			id: 'spacer',
			title: 'Separators + spacer',
			lang: 'svelte',
			code: `<Toolbar
  items={[
    { label: 'New', icon: 'i-glyph:add-circle' },
    { label: 'Open', icon: 'i-glyph:folder-open' },
    { itemType: 'separator' },
    { label: 'Save', icon: 'i-glyph:diskette' },
    { itemType: 'spacer' },
    { label: 'Settings', icon: 'i-glyph:settings' }
  ]}
/>`
		},
		{
			id: 'vertical',
			title: 'Vertical orientation',
			lang: 'svelte',
			code: `<Toolbar items={tools} position="left" compact />`
		}
	],
	docs: toolbarDocs
}

export default meta

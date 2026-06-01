import type { DemoMeta } from '../../types'
import docs from './docs.md?raw'
const meta: DemoMeta = {
	id: 'floating-action',
	title: 'FloatingAction',
	description: 'Floating action button (FAB) with vertical, horizontal, or radial reveal of secondary actions.',
	keywords: [
		'fab', 'floating-action', 'speed-dial', 'quick-actions',
		'plus-button', 'overlay-button', 'corner-button', 'radial-menu'
	],
	category: 'navigation',
	icon: '球',
	load: () => import('./index.svelte'),
	tool: {
		name: 'mount_floating_action',
		description: 'Mount a FloatingAction (FAB) on the canvas.',
		parameters: { items: 'array of action objects', expand: 'vertical | horizontal | radial' }
	},
	inline: { capable: true },
	variants: [],
	api: {
		props: [
			{ name: 'items', type: 'FloatingActionItem[]', default: '[]', desc: 'Action items with `label`, `value`, `icon`' },
			{ name: 'fields', type: 'Record<string, string>', desc: 'Remap data keys to component fields' },
			{ name: 'icons', type: '{ add?: string; close?: string }', desc: 'Icons for the FAB itself (closed → add, open → close)' },
			{ name: 'label', type: 'string', default: "'Actions'", desc: 'Accessible label for the trigger' },
			{ name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", desc: 'Button size' },
			{ name: 'position', type: "'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'", default: "'bottom-right'", desc: 'Corner the FAB anchors to' },
			{ name: 'expand', type: "'vertical' | 'horizontal' | 'radial'", default: "'vertical'", desc: 'How items reveal when the FAB opens' },
			{ name: 'itemAlign', type: "'start' | 'center' | 'end'", default: "'center'", desc: 'Where labels sit relative to icons inside each action' },
			{ name: 'open', type: 'boolean', default: 'false', desc: 'Open state', bindable: true },
			{ name: 'backdrop', type: 'boolean', default: 'true', desc: 'Render a click-outside dim layer when open' },
			{ name: 'contained', type: 'boolean', default: 'false', desc: 'Anchor to parent corner instead of viewport' },
			{ name: 'disabled', type: 'boolean', default: 'false', desc: 'Disable the FAB' },
			{ name: 'class', type: 'string', default: "''", desc: 'Extra CSS classes' }
		],
		events: [
			{ name: 'onselect', signature: '(value, proxy) => void', desc: 'Fires when an action is activated' },
			{ name: 'onopen', signature: '() => void', desc: 'Fires when the FAB opens' },
			{ name: 'onclose', signature: '() => void', desc: 'Fires when the FAB closes' }
		],
		attrs: [
			{ selector: '[data-floating-action]', desc: 'Root (carries data-position, data-expand, data-open)' },
			{ selector: '[data-floating-action-trigger]', desc: 'The FAB itself' },
			{ selector: '[data-floating-action-item]', desc: 'Each revealed action' },
			{ selector: '[data-floating-action-backdrop]', desc: 'Dim layer (when backdrop is enabled)' }
		]
	},
	snippets: [
		{
			id: 'intro',
			title: 'Basic — vertical expand',
			lang: 'svelte',
			code: `<script>
  import { FloatingAction } from '@rokkit/ui'

  const actions = [
    { label: 'Edit', value: 'edit', icon: 'i-glyph:edit' },
    { label: 'Copy', value: 'copy', icon: 'i-glyph:copy' },
    { label: 'Share', value: 'share', icon: 'i-glyph:share' }
  ]
</script>

<FloatingAction
  items={actions}
  icon="i-glyph:add-circle"
  onselect={(v) => console.log(v)}
/>`
		},
		{
			id: 'radial',
			title: 'Radial expand',
			lang: 'svelte',
			code: `<FloatingAction items={actions} expand="radial" position="bottom-right" />`
		},
		{
			id: 'contained',
			title: 'Card-scoped (contained)',
			lang: 'svelte',
			code: `<div class="card relative">
  <FloatingAction items={actions} contained position="bottom-right" />
</div>`
		}
	],
	docs
}

export default meta

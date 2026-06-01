import type { DemoMeta } from '../../types'
import { floatingNavigationDocs } from './docs'

const meta: DemoMeta = {
	id: 'floating-navigation',
	title: 'FloatingNavigation',
	description: 'Edge-anchored section navigator — dots that track scroll, expand on hover, and pin open.',
	keywords: [
		'floating-nav', 'section-nav', 'page-dots', 'scroll-spy',
		'intersection-observer', 'sidebar-dots', 'minimap'
	],
	category: 'navigation',
	icon: '針',
	load: () => import('./index.svelte'),
	tool: {
		name: 'mount_floating_navigation',
		description: 'Mount a FloatingNavigation rail tracking the canvas demo sections.',
		parameters: { items: 'array of section items with label/icon/href' }
	},
	inline: { capable: true },
	variants: [],
	api: {
		props: [
			{ name: 'items', type: 'unknown[]', default: '[]', desc: 'Section items with `label`, `value`, `icon`, and optional `href` (e.g. `#intro`)' },
			{ name: 'fields', type: 'Record<string, string>', desc: 'Remap data keys to component fields' },
			{ name: 'value', type: 'unknown', desc: 'Currently active section value', bindable: true },
			{ name: 'pinned', type: 'boolean', default: 'false', desc: 'Stay expanded instead of collapsing on mouse-leave', bindable: true },
			{ name: 'observe', type: 'boolean', default: 'true', desc: 'Auto-sync value to the section in view via IntersectionObserver' },
			{ name: 'observerOptions', type: 'IntersectionObserverInit', desc: 'Tune the observer trigger band (rootMargin, threshold)' },
			{ name: 'position', type: "'top' | 'right' | 'bottom' | 'left'", default: "'right'", desc: 'Screen edge to anchor to — top/bottom render horizontally' },
			{ name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", desc: 'Dot size variant' },
			{ name: 'icons', type: '{ pin?: string; unpin?: string }', desc: 'Override the pin/unpin glyphs' },
			{ name: 'label', type: 'string', desc: 'Accessible label for the nav landmark' },
			{ name: 'class', type: 'string', default: "''", desc: 'Extra CSS classes' }
		],
		events: [
			{ name: 'onselect', signature: '(value, item) => void', desc: 'Fires when a section is activated' },
			{ name: 'onpinchange', signature: '(pinned: boolean) => void', desc: 'Fires when the pin toggles' }
		],
		attrs: [
			{ selector: '[data-floating-nav]', desc: 'Root (carries data-position, data-pinned, data-expanded)' },
			{ selector: '[data-floating-nav-item]', desc: 'Each dot (carries data-active)' },
			{ selector: '[data-floating-nav-pin]', desc: 'The pin/unpin toggle' }
		]
	},
	snippets: [
		{
			id: 'intro',
			title: 'Basic — right-anchored, observed',
			lang: 'svelte',
			code: `<script>
  import { FloatingNavigation } from '@rokkit/ui'

  const items = [
    { label: 'Introduction', value: 'intro',    icon: 'i-glyph:book',   href: '#intro' },
    { label: 'Features',     value: 'features', icon: 'i-glyph:star',   href: '#features' },
    { label: 'Contact',      value: 'contact',  icon: 'i-glyph:letter', href: '#contact' }
  ]
</script>

<FloatingNavigation {items} value="intro" position="right" />`
		},
		{
			id: 'pinned',
			title: 'Pinned open',
			lang: 'svelte',
			code: `<FloatingNavigation {items} position="left" bind:pinned />`
		},
		{
			id: 'unobserved',
			title: 'Manual value control',
			lang: 'svelte',
			code: `<FloatingNavigation {items} bind:value observe={false} />`
		}
	],
	docs: floatingNavigationDocs
}

export default meta

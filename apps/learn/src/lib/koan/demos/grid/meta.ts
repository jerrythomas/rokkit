import type { DemoMeta } from '../../types'
import docs from './docs.md?raw'
const meta: DemoMeta = {
	id: 'grid',
	title: 'Grid',
	description: 'Responsive tile grid — auto-fill columns with arrow-key navigation and selectable tiles.',
	keywords: [
		'grid', 'tiles', 'gallery', 'auto-fill', 'tile-picker',
		'app-launcher', 'card-grid', 'picker'
	],
	category: 'layout',
	icon: '網',
	load: () => import('./index.svelte'),
	tool: {
		name: 'mount_grid',
		description: 'Mount a Grid tile picker on the canvas.',
		parameters: { items: 'array of tile objects with label/icon', minSize: 'CSS length' }
	},
	inline: { capable: true },
	variants: [],
	api: {
		props: [
			{ name: 'items', type: 'unknown[]', default: '[]', desc: 'Tile data (objects with `label`, `icon`, `value`)' },
			{ name: 'fields', type: 'Record<string, string>', desc: 'Remap data keys to component fields' },
			{ name: 'value', type: 'unknown', desc: 'Selected value', bindable: true },
			{ name: 'minSize', type: 'string', default: "'120px'", desc: 'Minimum tile width — drives auto-fill column count' },
			{ name: 'gap', type: 'string', default: "'1rem'", desc: 'CSS gap between tiles' },
			{ name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", desc: 'Content size variant (padding + icon scale)' },
			{ name: 'disabled', type: 'boolean', default: 'false', desc: 'Disable interaction' },
			{ name: 'label', type: 'string', desc: 'Accessible label for the grid role' },
			{ name: 'class', type: 'string', default: "''", desc: 'Extra CSS classes' }
		],
		events: [
			{ name: 'onselect', signature: '(value, proxy) => void', desc: 'Fires when a tile is activated' }
		],
		attrs: [
			{ selector: '[data-grid]', desc: 'Root container (role=grid, carries data-size)' },
			{ selector: '[data-grid-item]', desc: 'Each tile button (carries data-active, data-disabled)' }
		]
	},
	snippets: [
		{
			id: 'intro',
			title: 'Basic — selectable tiles',
			lang: 'svelte',
			code: `<script>
  import { Grid } from '@rokkit/ui'

  const items = [
    { label: 'Dashboard', icon: 'i-glyph:home' },
    { label: 'Reports',   icon: 'i-glyph:chart' },
    { label: 'Settings',  icon: 'i-glyph:settings' }
  ]

  let selected = $state(null)
</script>

<Grid {items} bind:value={selected} />`
		},
		{
			id: 'sizing',
			title: 'Sizing — minSize + size',
			lang: 'svelte',
			code: `<Grid items={tools} minSize="80px" size="sm" />
<Grid items={tools} minSize="160px" size="lg" />`
		},
		{
			id: 'fields',
			title: 'Custom field mapping',
			lang: 'svelte',
			code: `<Grid items={data} fields={{ label: 'title', value: 'id' }} />`
		},
		{
			id: 'defaults',
			title: 'Icons, badges, descriptions — all data (no snippet)',
			lang: 'svelte',
			code: `<Grid items={[
  { label: 'Rokkit',   icon: 'i-glyph:sparkle', description: 'Component library',  value: 'rokkit' },
  { label: 'Minimal',  icon: 'i-glyph:minus',   description: 'Stripped-down style', value: 'minimal', badge: 'new' },
  { label: 'Material', icon: '🎨',              description: 'Google-inspired',     value: 'material' }
]} bind:value />

<!-- icon takes a CSS icon class OR a literal char/emoji;
     description, badge, and shortcut all render automatically. -->`
		},
		{
			id: 'named',
			title: 'Custom markup for one tile (Tier 2)',
			lang: 'svelte',
			code: `<script>
  const items = [
    { label: 'Rokkit',   value: 'rokkit',   icon: 'i-glyph:sparkle' },
    { label: 'Featured', value: 'featured', icon: 'i-glyph:star', snippet: 'featured' },
    { label: 'Minimal',  value: 'minimal',  icon: 'i-glyph:minus' } // stays default
  ]
</script>

<Grid {items} bind:value>
  {#snippet featured(proxy)}
    <span class={proxy.icon} aria-hidden="true"></span>
    <span class="font-bold">{proxy.label}</span>
    <span class="text-xs text-accent">Editor's pick</span>
  {/snippet}
</Grid>`
		},
		{
			id: 'theming',
			title: 'Theme via class (UnoCSS arbitrary variants)',
			lang: 'svelte',
			code: `<Grid {items} bind:value class="
  [&_[data-grid-item]]:p-3
  [&_[data-grid-item][data-active]]:ring-2 [&_[data-grid-item][data-active]]:ring-accent
  [&_[data-item-badge]]:text-xs [&_[data-item-badge]]:text-ink-mute
" />`
		}
	],
	docs
}

export default meta

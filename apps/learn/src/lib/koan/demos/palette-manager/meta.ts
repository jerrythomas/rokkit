import type { DemoMeta } from '../../types'
import docs from './docs.md?raw'
const meta: DemoMeta = {
	id: 'palette-manager',
	title: 'PaletteManager',
	description: 'Interactive palette editor for semantic theme roles — presets, hex, persistence.',
	keywords: [
		'palette', 'palette-manager', 'colors', 'theme-editor',
		'tailwind-colors', 'design-tokens', 'roles', 'skin-editor'
	],
	category: 'content',
	icon: '彩',
	load: () => import('./index.svelte'),
	tool: {
		name: 'mount_palette_manager',
		description: 'Mount the PaletteManager editor on the canvas.',
		parameters: { presets: 'optional preset list', autoApply: 'apply on every change' }
	},
	inline: { capable: true },
	variants: [],
	api: {
		props: [
			{ name: 'value', type: 'PaletteConfig', desc: 'Active palette mapping (role → tailwind color or hex)', bindable: true },
			{ name: 'presets', type: 'PalettePreset[]', desc: 'Preset list shown at the top — defaults to the 20-color Tailwind preset set' },
			{ name: 'custom', type: 'PaletteConfig[]', default: '[]', desc: 'User-saved custom palettes', bindable: true },
			{ name: 'storageKey', type: 'string', desc: 'localStorage key for persistence (omit for transient editing)' },
			{ name: 'roles', type: 'ColorRole[]', desc: 'Roles to render rows for — defaults to 8 semantic roles (primary/secondary/accent/surface/success/warning/danger/info)' },
			{ name: 'autoApply', type: 'boolean', default: 'true', desc: 'Apply changes to the DOM on every mutation (vs. requiring an explicit Apply click)' },
			{ name: 'showPresets', type: 'boolean', default: 'true', desc: 'Render the preset chooser at the top' },
			{ name: 'showSave', type: 'boolean', default: 'true', desc: 'Render the Save / Save As affordances' },
			{ name: 'compact', type: 'boolean', default: 'false', desc: 'Tighter row spacing — for sidebars / panels' },
			{ name: 'icons', type: 'Partial<PaletteManagerIcons>', desc: 'Override the save / check / presets / hex icons' },
			{ name: 'class', type: 'string', default: "''", desc: 'Extra CSS classes' }
		],
		events: [
			{ name: 'onchange', signature: '(value: PaletteConfig) => void', desc: 'Fires on every mapping mutation' },
			{ name: 'onsave', signature: '(value: PaletteConfig) => void', desc: 'Fires when the user saves the current mapping' },
			{ name: 'onapply', signature: '(value: PaletteConfig) => void', desc: 'Fires when the user clicks Apply (or every change if autoApply)' }
		],
		attrs: [
			{ selector: '[data-palette-manager]', desc: 'Root (carries data-compact)' },
			{ selector: '[data-palette-role-row]', desc: 'A single role row (carries data-role)' },
			{ selector: '[data-palette-presets]', desc: 'Preset chooser strip' }
		]
	},
	snippets: [
		{
			id: 'intro',
			title: 'Basic — default mapping, auto-apply',
			lang: 'svelte',
			code: `<script>
  import { PaletteManager } from '@rokkit/ui'
  let palette = $state(null) // initialised to defaultPaletteConfig
</script>

<PaletteManager bind:value={palette} autoApply />`
		},
		{
			id: 'persisted',
			title: 'Persisted with storageKey',
			lang: 'svelte',
			code: `<PaletteManager
  bind:value={palette}
  bind:custom={savedPalettes}
  storageKey="my-app:palette"
/>`
		},
		{
			id: 'compact',
			title: 'Compact for sidebar',
			lang: 'svelte',
			code: `<PaletteManager bind:value={palette} compact />`
		}
	],
	docs
}

export default meta

import { defineConfig } from 'unocss'
import { presetRokkit } from '@rokkit/unocss'
import config from './rokkit.config.js'

const siteIcons = [
	'i-solar:calendar-bold-duotone',
	'i-solar:sidebar-bold-duotone',
	'i-solar:rocket-bold-duotone',
	'i-solar:database-bold-duotone',
	'i-solar:layers-bold-duotone',
	'i-solar:code-square-bold-duotone',
	'i-solar:palette-bold-duotone',
	'i-solar:eye-bold-duotone',
	'i-solar:hamburger-menu-bold-duotone',
	'i-solar:file-text-bold-duotone',
	'i-solar:minimize-square-bold-duotone',
	'i-solar:widget-bold-duotone',
	'i-solar:notes-bold-duotone',
	'i-solar:cpu-bolt-bold-duotone',
	'i-solar:info-circle-bold-duotone',
	'i-solar:list-bold-duotone',
	'i-solar:alt-arrow-down-bold-duotone',
	'i-solar:table-bold-duotone',
	// Additional icons used in docs
	'i-solar:add-circle-bold-duotone',
	'i-solar:alt-arrow-up-bold-duotone',
	'i-solar:book-bold-duotone',
	'i-solar:chart-bold-duotone',
	'i-solar:check-circle-bold-duotone',
	'i-solar:chat-square-code-bold-duotone',
	'i-solar:close-circle-bold-duotone',
	'i-solar:code-bold-duotone',
	'i-solar:document-text-bold-duotone',
	'i-solar:graph-new-bold-duotone',
	'i-solar:keyboard-bold-duotone',
	'i-solar:magnifer-bold-duotone',
	'i-solar:map-arrow-right-bold-duotone',
	'i-solar:minus-circle-bold-duotone',
	'i-solar:pallete-2-bold-duotone',
	'i-solar:settings-bold-duotone',
	'i-solar:stars-bold-duotone'
]

const componentIcons = [
	'accordion', 'button', 'card', 'calendar', 'carousel', 'checkbox',
	'combobox', 'crumbs', 'dropdown', 'icon', 'input-text', 'item',
	'list', 'message', 'palette', 'pill', 'progress', 'range',
	'multiselect', 'select', 'settings', 'stepper', 'switch', 'tabs',
	'table', 'tree', 'radio', 'rating', 'input-password'
].map((icon) => `i-component:${icon}`)

export default defineConfig({
	presets: [presetRokkit(config)],
	shortcuts: [
		['text-on-primary', 'text-surface-50'],
		['text-on-secondary', 'text-surface-50'],
		['text-on-info', 'text-surface-50'],
		['text-on-success', 'text-surface-50'],
		['text-on-warning', 'text-surface-50'],
		['text-on-error', 'text-surface-50'],
		['text-on-surface', 'text-surface-50']
	],
	safelist: [...siteIcons, ...componentIcons],
	content: {
		pipeline: {
			include: [
				'src/**/*.{svelte,js,ts}',
				'../../packages/themes/src/**/*.css',
				'../../packages/ui/src/**/*.svelte'
			]
		}
	}
})

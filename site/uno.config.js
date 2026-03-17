import { defineConfig } from 'unocss'
import { presetRokkit, presetBackgrounds } from '@rokkit/unocss'
import config from './rokkit.config.js'

const siteIcons = [
	'i-glyph:add-circle',
	'i-glyph:alt-arrow-down',
	'i-glyph:alt-arrow-up',
	'i-glyph:arrow-left',
	'i-glyph:atom',
	'i-glyph:bell',
	'i-glyph:book-2',
	'i-glyph:calendar',
	'i-glyph:card',
	'i-glyph:chart-2',
	'i-glyph:chart',
	'i-glyph:chart-square',
	'i-glyph:chat-square-code',
	'i-glyph:check-circle',
	'i-glyph:checklist-minimalistic',
	'i-glyph:clock-circle',
	'i-glyph:close-circle',
	'i-glyph:code',
	'i-glyph:code-square',
	'i-glyph:cursor',
	'i-glyph:database',
	'i-glyph:eye',
	'i-glyph:file-text',
	'i-glyph:flag',
	'i-glyph:folder-open',
	'i-glyph:gallery-wide',
	'i-glyph:gamepad',
	'i-glyph:git-merge',
	'i-glyph:graph-new',
	'i-glyph:hamburger-menu',
	'i-glyph:home',
	'i-glyph:hourglass',
	'i-glyph:keyboard',
	'i-glyph:layers',
	'i-glyph:layers-minimalistic',
	'i-glyph:list-check',
	'i-glyph:magic-stick',
	'i-glyph:magnifer',
	'i-glyph:minimize-square',
	'i-glyph:minus-circle',
	'i-glyph:palette',
	'i-glyph:rocket',
	'i-glyph:settings',
	'i-glyph:shield',
	'i-glyph:sidebar',
	'i-glyph:table',
	'i-glyph:user',
	'i-glyph:users-group-two-rounded',
	'i-glyph:widget',
]

const componentIcons = [
	'accordion',
	'button',
	'card',
	'calendar',
	'carousel',
	'checkbox',
	'combobox',
	'crumbs',
	'dropdown',
	'icon',
	'input-text',
	'item',
	'list',
	'message',
	'palette',
	'pill',
	'progress',
	'range',
	'multiselect',
	'select',
	'settings',
	'stepper',
	'switch',
	'tabs',
	'table',
	'tree',
	'radio',
	'rating',
	'input-password'
].map((icon) => `i-glyph:${icon}`)

export default defineConfig({
	presets: [presetRokkit(config), presetBackgrounds()],
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
				'../packages/themes/src/**/*.css',
				'../packages/ui/src/**/*.svelte'
			]
		}
	}
})

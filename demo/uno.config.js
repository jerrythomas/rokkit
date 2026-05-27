import { defineConfig, transformerDirectives } from 'unocss'
import presetIcons from '@unocss/preset-icons'
import { presetRokkit, presetBackgrounds } from '@rokkit/unocss'
import config from './rokkit.config.js'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const glyphData = require('@rokkit/icons/glyph.json')
const glyphIcons = Object.keys(glyphData.icons).map((n) => `i-glyph:${n}`)

export default defineConfig({
	transformers: [transformerDirectives()],
	presets: [
		presetRokkit(config),
		presetBackgrounds(),
		presetIcons({
			scale: 1.2,
			extraProperties: {
				display: 'inline-block',
				'vertical-align': 'middle'
			}
		})
	],
	theme: {
		fontSize: {
			'2xs':  ['10px',   { 'line-height': '1.4' }],  // micro: timestamps, status labels
			'xs':   ['11.5px', { 'line-height': '1.4' }],  // small: session list labels
			'sm':   ['13px',   { 'line-height': '1.5' }],  // body base
			'base': ['14px',   { 'line-height': '1.5' }],  // body md: card headings
			'md':   ['17px',   { 'line-height': '1.4' }],  // section headings
			'lg':   ['20px',   { 'line-height': '1.3' }],  // sidebar logo
			'xl':   ['22px',   { 'line-height': '1.2' }],  // wizard logo
			'2xl':  ['28px',   { 'line-height': '1.1' }],  // page h1
			'4xl':  ['36px',   { 'line-height': '1'   }],  // kanji / display
		}
	},
	shortcuts: [
		// `text-on-primary` is handled by presetRokkit via the named-token
		// vocabulary (resolves to `var(--on-primary)`). Don't override here.
		['text-on-secondary', 'text-surface-50'],
		['text-on-surface', 'text-surface-50']
	],
	safelist: [
		// Theme palette tokens — ensure z-alias CSS vars are always emitted
		// (used via var(--color-*) in app.css color-mix() expressions)
		'bg-surface-z0', 'bg-surface-z1', 'bg-surface-z2', 'bg-surface-z9',
		'bg-primary-z5', 'text-primary-z5',
		'text-ink-z1',
		...glyphIcons,
		'i-glyph:home',
		'i-glyph:chart',
		'i-glyph:chart-2',
		'i-glyph:table',
		'i-glyph:chart-square',
		'i-glyph:database',
		'i-glyph:bell',
		'i-glyph:settings',
		'i-glyph:user',
		'i-glyph:sun',
		'i-glyph:moon',
		'i-glyph:monitor',
		'i-glyph:palette',
		'i-glyph:magic-stick',
		'i-glyph:layers',
    'i-glyph:list-items',
		// Iconify mdi-* icons used dynamically (via `class={item.icon}`)
		// on the landing + /app conv list — UnoCSS scanner can't see them.
		'i-mdi:chat-outline',
		'i-mdi:layers-outline',
		'i-mdi:palette',
		'i-mdi:format-line-spacing',
		'i-mdi:format-list-bulleted',
		'i-mdi:table',
		'i-mdi:magic-staff',
		'i-mdi:refresh',
		'i-mdi:widgets-outline',
		'i-mdi:form-textbox',
		'i-mdi:arrow-right',
		'i-mdi:magnify',
		'i-mdi:tab',
		'i-mdi:file-tree',
		'i-mdi:select-multiple',
		'i-mdi:help-circle-outline',
		'i-mdi:book-open-variant'
	],
	content: {
		pipeline: {
			include: [
				'src/**/*.{svelte,js,ts,css}',
				'../packages/themes/src/**/*.css',
				'../packages/ui/src/**/*.svelte'
			]
		}
	}
})

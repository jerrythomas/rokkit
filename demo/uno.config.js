import { defineConfig, transformerDirectives } from 'unocss'
import { presetRokkit, presetBackgrounds } from '@rokkit/unocss'
import config from './rokkit.config.js'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const glyphData = require('@rokkit/icons/glyph.json')
const glyphIcons = Object.keys(glyphData.icons).map((n) => `i-glyph:${n}`)

export default defineConfig({
	transformers: [transformerDirectives()],
	presets: [presetRokkit(config), presetBackgrounds()],
	theme: {
		fontSize: {
			'2xs':  ['10px',   { lineHeight: '1.4' }],  // micro: timestamps, status labels
			'xs':   ['11.5px', { lineHeight: '1.4' }],  // small: session list labels
			'sm':   ['13px',   { lineHeight: '1.5' }],  // body base
			'base': ['14px',   { lineHeight: '1.5' }],  // body md: card headings
			'md':   ['17px',   { lineHeight: '1.4' }],  // section headings
			'lg':   ['20px',   { lineHeight: '1.3' }],  // sidebar logo
			'xl':   ['22px',   { lineHeight: '1.2' }],  // wizard logo
			'2xl':  ['28px',   { lineHeight: '1.1' }],  // page h1
			'4xl':  ['36px',   { lineHeight: '1'   }],  // kanji / display
		}
	},
	shortcuts: [
		['text-on-primary', 'text-surface-50'],
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
    'i-glyph:list-items'
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

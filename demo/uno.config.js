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
	shortcuts: [
		['text-on-primary', 'text-surface-50'],
		['text-on-secondary', 'text-surface-50'],
		['text-on-surface', 'text-surface-50']
	],
	safelist: [
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

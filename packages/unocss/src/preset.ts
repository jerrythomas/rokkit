// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import extractorSvelte from '@unocss/extractor-svelte'
import {
	presetIcons,
	presetTypography,
	presetWind3,
	transformerDirectives,
	transformerVariantGroup
} from 'unocss'
import type { Preset } from 'unocss'
import { shades, defaultPalette, DEFAULT_ICONS, iconShortcuts, Theme, defaultColors } from '@rokkit/core'
import { iconCollections } from '@rokkit/core/vite'
import { loadConfig } from './config.js'

const THEME_CONFIG = {
	dark: {
		light: '[data-mode="light"]',
		dark: '[data-mode="dark"]'
	}
}

const FONT_FAMILIES = {
	mono: ['Victor Mono', 'monospace'],
	heading: ['Open Sans', 'sans-serif'],
	sans: ['Overpass', 'ui-serif', 'sans-serif'],
	body: ['Open Sans', '-apple-system', 'system-ui', 'Segoe-UI', 'ui-serif', 'sans-serif']
}

function buildIconCollections(configIcons) {
	return iconCollections({
		rokkit: '@rokkit/icons/ui.json',
		...configIcons
	})
}

function buildSafelist() {
	return [
		...DEFAULT_ICONS,
		...defaultPalette.flatMap((color) => shades.map((shade) => `bg-${color}-${shade}`)),
		...defaultPalette.flatMap((color) => shades.map((shade) => `bg-${color}-${shade}/50`))
	]
}

function buildPreflights(theme) {
	const vars = theme.getPalette()
	const cssVars = Object.entries(vars)
		.map(([k, v]) => `${k}:${v}`)
		.join(';')
	return [{ getCSS: () => `:root{${cssVars}}` }]
}

function buildShortcuts(theme, config) {
	const shortcuts = []

	for (const [name, mapping] of Object.entries(config.skins)) {
		shortcuts.push([`skin-${name}`, theme.getPalette(mapping)])
	}

	const variants = Object.keys(config.colors)
	for (const variant of variants) {
		shortcuts.push(...theme.getShortcuts(variant))
	}

	const baseIconShortcuts = iconShortcuts(DEFAULT_ICONS, 'i-rokkit')
	const overrides = (config.icons?.overrides as Record<string, string>) || {}
	shortcuts.push(...Object.entries({ ...baseIconShortcuts, ...overrides }))

	return shortcuts
}

export function presetRokkit(options = {}): Preset {
	const config = loadConfig(options)
	const mergedColors = { ...defaultColors, ...config.palettes }
	const theme = new Theme({ colors: mergedColors, mapping: config.colors })

	return {
		name: 'rokkit',
		presets: [
			presetWind3(THEME_CONFIG),
			presetTypography(),
			presetIcons({
				extraProperties: { display: 'inline-block' },
				collections: buildIconCollections(config.icons)
			})
		],
		extractors: [extractorSvelte()],
		rules: [['hidden', { display: 'none' }]],
		safelist: buildSafelist(),
		preflights: buildPreflights(theme),
		shortcuts: buildShortcuts(theme, config),
		theme: {
			fontFamily: FONT_FAMILIES,
			colors: theme.getColorRules()
		},
		transformers: [transformerDirectives(), transformerVariantGroup()]
	}
}

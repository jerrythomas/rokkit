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
import {
	shades,
	defaultPalette,
	DEFAULT_ICONS,
	iconShortcuts,
	Theme,
	defaultColors
} from '@rokkit/core'
import { iconCollections } from '@rokkit/core/vite'
import { loadConfig } from './config.js'

const THEME_CONFIG = {
	dark: {
		light: ':is([data-mode="light"],[data-mode="light"] *)',
		dark: ':is([data-mode="dark"],[data-mode="dark"] *)'
	}
}

const FONT_FAMILIES = {
	mono: ['var(--font-mono)'],
	heading: ['var(--font-heading)'],
	sans: ['var(--font-sans)'],
	body: ['var(--font-sans)']
}

function buildIconCollections(configIcons) {
	return iconCollections({
		rokkit: '@rokkit/icons/ui.json',
		semantic: '@rokkit/icons/semantic.json',
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

const RADIUS_PRESETS = {
	sharp: { sm: '0', md: '0', lg: '0', xl: '0', full: '9999px' },
	rounded: { sm: '0.25rem', md: '0.375rem', lg: '0.5rem', xl: '0.75rem', full: '9999px' },
	pill: { sm: '9999px', md: '9999px', lg: '9999px', xl: '9999px', full: '9999px' }
}

function buildTypographyVars(typography): string[] {
	if (!typography) return []
	return [
		typography.sans ? `--font-sans:${typography.sans}` : '',
		typography.mono ? `--font-mono:${typography.mono}` : '',
		typography.heading ? `--font-heading:${typography.heading}` : ''
	].filter(Boolean)
}

function buildRadiusVars(shape): string[] {
	const radiusKey = shape?.radius
	if (!radiusKey) return []
	const preset = typeof radiusKey === 'string' ? RADIUS_PRESETS[radiusKey] : radiusKey
	if (!preset) return []
	return (['sm', 'md', 'lg', 'xl', 'full'] as const)
		.filter((k) => preset[k] !== undefined)
		.map((k) => `--radius-${k}:${preset[k]}`)
}

function buildPreflights(theme, config) {
	const vars = theme.getPalette()
	const cssVars = Object.entries(vars)
		.map(([k, v]) => `${k}:${v}`)
		.join(';')

	const extraVars = [...buildTypographyVars(config.typography), ...buildRadiusVars(config.shape)]
	const allVars = extraVars.length > 0 ? `${cssVars};${extraVars.join(';')}` : cssVars
	return [{ getCSS: () => `:root{${allVars}}` }]
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

	const iconStyle = config.icons?.style || undefined
	const iconCollection = config.icons?.collection ? `i-${config.icons.collection}` : 'i-semantic'
	const baseIconShortcuts = iconShortcuts(DEFAULT_ICONS, iconCollection, iconStyle)
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
		preflights: buildPreflights(theme, config),
		shortcuts: buildShortcuts(theme, config),
		theme: {
			fontFamily: FONT_FAMILIES,
			colors: { ...theme.getColorRules(), ...config.palettes }
		},
		transformers: [transformerDirectives(), transformerVariantGroup()]
	}
}

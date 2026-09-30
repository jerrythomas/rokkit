import extractorSvelte from '@unocss/extractor-svelte'
import {
	presetIcons,
	presetTypography,
	presetWind3,
	transformerDirectives,
	transformerVariantGroup
} from 'unocss'
import type { Preset } from 'unocss'
import { loadConfig, resolveColormap } from './config.js'
import { rootExtraVars } from './typography.js'
import { themeFor, rootPreflights, skinPreflights, themeColors } from './colors.js'
import { checkInkContrast } from './contrast.js'
import { iconCollectionsFor, safelist, shortcuts } from './shortcuts.js'

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

// ─── Preset ──────────────────────────────────────────────────────────────────

export function presetRokkit(options = {}): Preset {
	const config = loadConfig(options)
	const colormap = resolveColormap(config)
	const theme = themeFor(colormap, config, 'light')
	checkInkContrast(config, colormap)

	return {
		name: 'rokkit',
		presets: [
			presetWind3(THEME_CONFIG),
			presetTypography(),
			presetIcons({
				extraProperties: { display: 'inline-block' },
				collections: iconCollectionsFor(config.icons)
			})
		],
		extractors: [extractorSvelte()],
		rules: [['hidden', { display: 'none' }]],
		safelist: safelist(config),
		preflights: [
			...rootPreflights(theme, colormap, config, rootExtraVars(config)),
			...skinPreflights(config)
		],
		shortcuts: shortcuts(theme, colormap, config),
		theme: {
			fontFamily: FONT_FAMILIES,
			colors: themeColors(theme, colormap, config)
		},
		transformers: [transformerDirectives(), transformerVariantGroup()]
	}
}

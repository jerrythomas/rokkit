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
	NAMED_TOKENS
} from '@rokkit/core'
import { iconCollections } from '@rokkit/core/vite'
import { loadConfig, resolveColormap } from './config.js'
import { isColorValue, PALETTE_REF_RE } from './custom-tokens.js'
import { NAMED_SHORTCUT_PREFIXES, buildNamedShortcuts } from './named-shortcuts.js'
import { rootExtraVars } from './typography.js'
import { themeFor, rootPreflights, skinPreflights, themeColors } from './colors.js'
import { checkInkContrast } from './contrast.js'

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

// ─── Builder helpers ─────────────────────────────────────────────────────────

function buildIconCollections(configIcons) {
	return iconCollections({
		// Always-available collections so consumers can reference
		// `i-rokkit:*`, `i-semantic:*`, `i-glyph:*` without declaring
		// them in their rokkit.config.js icons map. Consumer entries
		// in `configIcons` override these by name (e.g. `{ glyph: ... }`
		// in the consumer config wins).
		rokkit: '@rokkit/icons/ui.json',
		semantic: '@rokkit/icons/semantic.json',
		glyph: '@rokkit/icons/glyph.json',
		...configIcons
	})
}

function buildSafelist(config) {
	// User-defined icon-shortcut keys go in the safelist too so the
	// shortcut chain emits CSS for them (else they're purged unless the
	// consumer manually safelists). DEFAULT_ICONS already in via the
	// constant list.
	const overrideNames = Object.keys((config?.icons?.overrides as Record<string, unknown>) ?? {})
	return [
		...DEFAULT_ICONS,
		...overrideNames,
		...defaultPalette.flatMap((color) => shades.map((shade) => `bg-${color}-${shade}`)),
		...defaultPalette.flatMap((color) => shades.map((shade) => `bg-${color}-${shade}/50`))
	]
}

function buildSemanticShortcuts(theme, colormap) {
	return Object.keys(colormap).flatMap((variant) => theme.getShortcuts(variant))
}

function buildIconShortcuts(config) {
	const iconCollection = config.icons?.collection ? `i-${config.icons.collection}` : 'i-semantic'
	const base = iconShortcuts(DEFAULT_ICONS, iconCollection, config.icons?.style)
	const overrides = (config.icons?.overrides as Record<string, string>) ?? {}
	return Object.entries({ ...base, ...overrides })
}

/**
 * Returns true when a token override resolves to a CSS color value.
 * Palette refs (`'kami.50'`) are always colors. Raw values are checked
 * with `isColorValue` (handles oklch/rgb/hsl/hex).
 */
function isOverrideTokenColor(value) {
	let candidate
	if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
		candidate = value.light ?? value.dark
	} else {
		candidate = value
	}
	if (typeof candidate !== 'string') return false
	if (PALETTE_REF_RE.test(candidate)) return true
	return isColorValue(candidate)
}

/**
 * Auto-emit Uno shortcuts for color-valued override tokens that are NOT
 * reserved named tokens (those already have shortcuts emitted by the named
 * layer). Reuses NAMED_SHORTCUT_PREFIXES, but emits only the color-meaningful
 * prefixes (bg, text, border, border-{t/b/l/r}, fill, stroke). The ring-
 * prefix is reserved for tokens whose name ends in `-ring`.
 */
function buildOverrideTokenShortcuts(config, namedTokenSet) {
	/* v8 ignore next — loadConfig always ensures overrides is {} */
	const overrides = config.overrides ?? {}
	return Object.entries(overrides)
		.filter(([name, value]) => !namedTokenSet.has(name) && isOverrideTokenColor(value))
		.flatMap(([name]) => shortcutsForOverrideToken(name))
}

/**
 * The color-meaningful shortcuts for one override token, one per prefix.
 * @param {string} name
 */
function shortcutsForOverrideToken(name) {
	return NAMED_SHORTCUT_PREFIXES
		// The ring- prefix is reserved for tokens whose name ends in `-ring`.
		.filter(({ prefix }) => prefix !== 'ring' || name.endsWith('-ring'))
		.map(({ prefix, prop }) => [`${prefix}-${name}`, { [prop]: `var(--${name})` }])
}

const NAMED_TOKEN_SET: Set<string> = new Set(NAMED_TOKENS)

function buildShortcuts(theme, colormap, config) {
	return [
		...buildSemanticShortcuts(theme, colormap),
		...buildNamedShortcuts(),
		...buildOverrideTokenShortcuts(config, NAMED_TOKEN_SET),
		...buildIconShortcuts(config)
	]
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
				collections: buildIconCollections(config.icons)
			})
		],
		extractors: [extractorSvelte()],
		rules: [['hidden', { display: 'none' }]],
		safelist: buildSafelist(config),
		preflights: [
			...rootPreflights(theme, colormap, config, rootExtraVars(config)),
			...skinPreflights(config)
		],
		shortcuts: buildShortcuts(theme, colormap, config),
		theme: {
			fontFamily: FONT_FAMILIES,
			colors: themeColors(theme, colormap, config)
		},
		transformers: [transformerDirectives(), transformerVariantGroup()]
	}
}

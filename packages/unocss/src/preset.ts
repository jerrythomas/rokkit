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
import { loadConfig, resolveColormap, isAlias } from './config.js'

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

const RADIUS_PRESETS = {
	sharp:   { sm: '0',        md: '0',        lg: '0',        xl: '0',      full: '9999px' },
	soft:    { sm: '0.125rem', md: '0.375rem', lg: '0.625rem', xl: '0.75rem', full: '9999px' },
	rounded: { sm: '0.25rem',  md: '0.5rem',   lg: '0.75rem',  xl: '1rem',   full: '9999px' },
	pill:    { sm: '9999px',   md: '9999px',   lg: '9999px',   xl: '9999px', full: '9999px' }
}

// ─── Shared predicate ────────────────────────────────────────────────────────

/**
 * Returns true when a colormap value is a { light?, dark? } dual-palette object
 * rather than a plain palette-name string.
 */
function isDualPalette(value) {
	return value !== null && typeof value === 'object' && !Array.isArray(value)
}

// ─── Colormap helpers ────────────────────────────────────────────────────────

/**
 * Returns true when any role in a colormap uses dual-palette syntax.
 */
function hasDualPaletteMapping(colormap) {
	return Object.values(colormap).some(isDualPalette)
}

/**
 * Resolves a colormap to flat palette-name strings for a given mode.
 * String values pass through unchanged.
 * { light, dark } objects resolve to the matching side, falling back to the other.
 */
function resolveMappingForMode(colormap, mode) {
	return Object.fromEntries(
		Object.entries(colormap).map(([role, value]) => [
			role,
			isDualPalette(value)
				? (mode === 'dark' ? (value.dark ?? value.light ?? null) : (value.light ?? value.dark ?? null))
				: value
		])
	)
}

// ─── CSS var serialization ───────────────────────────────────────────────────

const toCssBlock = (vars) => Object.entries(vars).map(([k, v]) => `${k}:${v}`).join(';')

// ─── Builder helpers ─────────────────────────────────────────────────────────

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

function buildTypographyVars(typography): string[] {
	if (!typography) return []
	const FONT_PROPS = { sans: '--font-sans', mono: '--font-mono', heading: '--font-heading' }
	return Object.entries(FONT_PROPS)
		.filter(([key]) => typography[key])
		.map(([key, prop]) => `${prop}:${typography[key]}`)
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

function buildPreflights(theme, colormap, config) {
	const rootVars = toCssBlock(theme.getPalette())
	const extraVars = [...buildTypographyVars(config.typography), ...buildRadiusVars(config.shape)]
	const allVars = extraVars.length > 0 ? `${rootVars};${extraVars.join(';')}` : rootVars

	let darkBlock = ''
	const nonAliasColormap = Object.fromEntries(
		Object.entries(colormap).filter(([, v]) => !isAlias(v))
	)
	if (hasDualPaletteMapping(nonAliasColormap)) {
		const darkTheme = new Theme({
			colors: { ...defaultColors, ...config.palettes },
			mapping: resolveMappingForMode(nonAliasColormap, 'dark'),
			colorSpace: config.colorSpace
		})
		darkBlock = `[data-mode="dark"]{${toCssBlock(darkTheme.getPalette())}}`
	}

	return [{ getCSS: () => `:root{${allVars}}${darkBlock}` }]
}

function buildSkinShortcuts(theme, config) {
	return Object.entries(config.skins).map(([name, mapping]) => {
		const nonAliasMapping = Object.fromEntries(
			Object.entries(mapping).filter(([, v]) => !isAlias(v))
		)
		return [
			`skin-${name}`,
			theme.getPalette(resolveMappingForMode(nonAliasMapping, 'light'))
		]
	})
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
 * Parses the OKLCH lightness value from a palette shade string.
 * Palette values are stored as "L C H" strings (e.g., "0.75 0.008 50").
 */
function parseLightness(oklchStr) {
	if (!oklchStr || typeof oklchStr !== 'string') return null
	const parts = oklchStr.trim().split(/\s+/)
	return parts.length >= 1 ? parseFloat(parts[0]) : null
}

/**
 * Resolves the palette object for a role from the colormap and config.
 */
function resolvePaletteForRole(role, colormap, config) {
	const value = colormap[role]
	if (!value || isAlias(value)) return null
	const paletteName = isDualPalette(value) ? (value.light ?? value.dark) : value
	return config.palettes[paletteName] ?? null
}

/**
 * Checks OKLCH lightness contrast between ink and surface at key z-levels.
 * Since ink has an inverted z-scale, ink-z1 maps to shade 900 while surface-z1 maps to shade 100.
 * We check that these complementary shades have sufficient lightness difference.
 */
function checkInkContrast(config, colormap) {
	const inkPalette = resolvePaletteForRole('ink', colormap, config)
	const surfacePalette = resolvePaletteForRole('surface', colormap, config)
	if (!inkPalette || !surfacePalette) return

	// z1: surface-100 vs ink-900, z3: surface-300 vs ink-700
	const checkLevels = [
		{ z: 'z1', surfaceShade: 100, inkShade: 900 },
		{ z: 'z3', surfaceShade: 300, inkShade: 700 },
	]

	for (const { z, surfaceShade, inkShade } of checkLevels) {
		const surfaceL = parseLightness(surfacePalette[surfaceShade])
		const inkL = parseLightness(inkPalette[inkShade])
		if (surfaceL !== null && inkL !== null) {
			const diff = Math.abs(surfaceL - inkL)
			if (diff < 0.3) {
				// eslint-disable-next-line no-console
				console.warn(
					`rokkit: ink-${z} on surface-${z} has low lightness contrast (${diff.toFixed(2)}). ` +
					`Consider a palette with more tonal range for ink.`
				)
			}
		}
	}
}

function buildTheme(config, colormap) {
	// Filter out aliases — they don't get their own CSS variables
	const nonAliasColormap = Object.fromEntries(
		Object.entries(colormap).filter(([, v]) => !isAlias(v))
	)
	return new Theme({
		colors: { ...defaultColors, ...config.palettes },
		mapping: resolveMappingForMode(nonAliasColormap, 'light'),
		colorSpace: config.colorSpace
	})
}

function buildThemeColors(theme, colormap, config) {
	const baseColors = { ...theme.getColorRules(), ...config.palettes }

	// Add alias color rules — point alias name to target's CSS variables
	for (const [role, value] of Object.entries(colormap)) {
		if (isAlias(value)) {
			const target = value.alias
			if (baseColors[target]) {
				// Generate color rules under the alias name that reference the target's CSS vars
				baseColors[role] = theme.mapVariant(
					theme.colors[theme.mapping[target]] || {},
					target
				)
			}
		}
	}

	return baseColors
}

function buildShortcuts(theme, colormap, config) {
	return [
		...buildSkinShortcuts(theme, config),
		...buildSemanticShortcuts(theme, colormap),
		...buildIconShortcuts(config)
	]
}

// ─── Preset ──────────────────────────────────────────────────────────────────

export function presetRokkit(options = {}): Preset {
	const config = loadConfig(options)
	const colormap = resolveColormap(config)
	const theme = buildTheme(config, colormap)
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
		safelist: buildSafelist(),
		preflights: buildPreflights(theme, colormap, config),
		shortcuts: buildShortcuts(theme, colormap, config),
		theme: {
			fontFamily: FONT_FAMILIES,
			colors: buildThemeColors(theme, colormap, config)
		},
		transformers: [transformerDirectives(), transformerVariantGroup()]
	}
}

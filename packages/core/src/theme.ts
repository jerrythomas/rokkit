// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { DEFAULT_THEME_MAPPING, defaultColors, TONE_MAP, INVERTED_ROLES } from './constants'
import { shades } from './colors/index'
import { ColorSpace } from './color-space'
import {
  NAMED_TOKENS,
  NAMED_TOKEN_SHADE_MAP,
  NAMED_TOKEN_ROLE_MAP
} from './named-tokens'

/**
 * Generate shades for a color using css variable and a ColorSpace adapter.
 *
 * @param {string} name
 * @param {string|import('./color-space').ColorSpace} space - color space name or adapter instance
 * @returns {Record<string|number, string>}
 */
export function shadesOf(name, space = 'rgb') {
	const adapter = typeof space === 'string' ? ColorSpace.create(space) : space

	return shades.reduce(
		(result, shade) => ({
			...result,
			[shade]: adapter.themeColor(`--color-${name}-${shade}`)
		}),
		{
			DEFAULT: adapter.themeColor(`--color-${name}-500`)
		}
	)
}

/**
 * Generates color rules for a specific theme variant, for both light and dark modes.
 *
 * @param {string} variant - The name of the variant to generate rules for.
 * @param {Object} colors - The object containing color definitions.
 * @param {Object} mapping - An object that maps variant names to color property names.
 * @param {import('./color-space').ColorSpace} adapter - ColorSpace adapter instance.
 * @returns {import('./types').ShadeMappings} An array containing the color rules for both light and dark modes.
 */
function generateColorRules(variant, colors, mapping, adapter) {
	return ['DEFAULT', ...shades].flatMap((shade) => [
		{
			key: shade === 'DEFAULT' ? `--color-${variant}` : `--color-${variant}-${shade}`,
			value: adapter.wrap(colors[mapping[variant]][`${shade}`])
		}
	])
}

/**
 * Constructs and returns the light and dark theme variants based on provided color mapping and color definitions.
 *
 * @param {Object} [mapping=DEFAULT_THEME_MAPPING] - An object mapping variant names to color property names.
 * @param {Object} [colors=defaultColors]        - The object containing default color definitions.
 * @param {string} [colorSpace] - Color space name for CSS variable values.
 * @returns {Array<Array>} An array containing two arrays, one for the light theme variant and another for the dark theme.
 */
export function themeRules(mapping = DEFAULT_THEME_MAPPING, colors = defaultColors, colorSpace) {
	mapping = { ...DEFAULT_THEME_MAPPING, ...mapping }
	colors = { ...defaultColors, ...colors }
	const adapter = ColorSpace.create(colorSpace || 'rgb')
	const variants = Object.keys(mapping)
	const rules = variants
		.flatMap((variant) => generateColorRules(variant, colors, mapping, adapter))
		.reduce((acc, { key, value }) => ({ ...acc, [key]: value }), {})

	return rules
}

const SEMANTIC_PREFIXES = [
	'bg',
	'border',
	'border-l',
	'border-r',
	'border-t',
	'border-b',
	'text',
	'ring',
	'outline',
	'from',
	'to',
	'divide',
	'stroke',
	'fill'
]

/**
 * @param {{ prefix: string, name: string, toneName: string, lightValue: number, darkValue: number }} opts
 * @returns {Array}
 */
function toneShortcuts({ prefix, name, toneName, lightValue, darkValue }) {
	const variantPattern = new RegExp(`^(.+):${prefix}-${name}-${toneName}(\\/\\d+)?$`)
	const opacityPattern = new RegExp(`^${prefix}-${name}-${toneName}(\\/\\d+)?$`)
	const exactPattern = `${prefix}-${name}-${toneName}`
	return [
		[
			variantPattern,
			([, variant, end]) =>
				`${variant}:${prefix}-${name}-${lightValue}${end || ''} ${variant}:dark:${prefix}-${name}-${darkValue}${end || ''}`
		],
		[
			opacityPattern,
			([, end]) =>
				`${prefix}-${name}-${lightValue}${end || ''} dark:${prefix}-${name}-${darkValue}${end || ''}`
		],
		[exactPattern, `${prefix}-${name}-${lightValue} dark:${prefix}-${name}-${darkValue}`]
	]
}

/**
 * Generates UnoCSS shortcut definitions for semantic tones with bg, border, text.
 * @param {string} name - Color name (e.g., 'primary')
 * @returns {Array} Array of shortcut definitions
 */
export function semanticShortcuts(name) {
	const inverted = INVERTED_ROLES.has(name)
	const shortcuts = []
	for (const [toneName, toneValue] of Object.entries(TONE_MAP)) {
		const lightValue = inverted ? 1000 - toneValue : toneValue
		const darkValue  = inverted ? toneValue : 1000 - toneValue
		for (const prefix of SEMANTIC_PREFIXES) {
			shortcuts.push(...toneShortcuts({ prefix, name, toneName, lightValue, darkValue }))
		}
	}
	return shortcuts
}

/**
 * Generates "on-color" text shortcuts for readable text on colored backgrounds.
 *
 * - `text-on-{name}` → high contrast text for use on z5+ backgrounds (always light text)
 * - `text-on-{name}-muted` → slightly muted but still readable on z5+ backgrounds
 *
 * @param {string} name - Color name (e.g., 'primary', 'surface')
 * @returns {Array} Array of shortcut definitions
 */
export function contrastShortcuts(name) {
	return [
		[
			new RegExp(`^text-on-${name}(\\/\\d+)?$`),
			([, end]) => `text-${name}-50${end || ''} dark:text-${name}-50${end || ''}`
		],
		[
			new RegExp(`^text-on-${name}-muted(\\/\\d+)?$`),
			([, end]) => `text-${name}-100${end || ''} dark:text-${name}-200${end || ''}`
		]
	]
}

/**
 * Fallback chain for nullable color mappings.
 * If a semantic color is null, it inherits from another semantic color.
 */
const COLOR_FALLBACKS = {
	ink: 'surface',
	tertiary: 'primary',
	secondary: 'primary',
	accent: 'primary',
	error: 'danger'
}

/**
 * Resolves null values in a color mapping by following the fallback chain.
 * @param {Record<string, string | null>} mapping
 * @returns {Record<string, string>}
 */
function resolveColors(mapping) {
	const resolved = { ...mapping }
	for (const [key, fallbackKey] of Object.entries(COLOR_FALLBACKS)) {
		if (resolved[key] === null || resolved[key] === undefined) {
			resolved[key] = resolved[fallbackKey] ?? DEFAULT_THEME_MAPPING[fallbackKey]
		}
	}
	return resolved
}

/**
 * Theme class for managing color palettes, mappings, and semantic shortcuts.
 */
export class Theme {
	#colors
	#mapping
	#adapter

	/**
	 *
	 * @param {import('./types.js').ColorTheme & { colorSpace?: string }} param0
	 */
	constructor({ colors = defaultColors, mapping = DEFAULT_THEME_MAPPING, colorSpace = 'rgb' } = {}) {
		this.#colors = { ...defaultColors, ...colors }
		this.#mapping = resolveColors({ ...DEFAULT_THEME_MAPPING, ...mapping })
		this.#adapter = ColorSpace.create(colorSpace)
	}

	get colors() {
		return this.#colors
	}
	set colors(colors) {
		this.#colors = { ...colors }
	}

	get mapping() {
		return this.#mapping
	}
	set mapping(mapping) {
		this.#mapping = resolveColors({ ...mapping })
	}

	get colorSpace() {
		return this.#adapter.name
	}
	set colorSpace(colorSpace) {
		this.#adapter = ColorSpace.create(colorSpace)
	}

	mapVariant(color, variant) {
		return Object.keys(color).reduce(
			(acc, key) => ({
				...acc,
				[key]:
					key === 'DEFAULT'
						? this.#adapter.themeColor(`--color-${variant}`)
						: this.#adapter.themeColor(`--color-${variant}-${key}`)
			}),
			{}
		)
	}

	getColorRules(mapping = null) {
		const variants = Object.entries({ ...this.#mapping, ...mapping })
		return variants.reduce(
			(acc, [variant, key]) => ({
				...acc,
				[variant]: this.mapVariant(this.#colors[key], variant)
			}),
			{}
		)
	}

	getPalette(mapping = null) {
		const useMapping = { ...this.#mapping, ...mapping }
		const useColors = { ...defaultColors, ...this.#colors }
		const variants = Object.keys(useMapping)
		const rules = variants
			.flatMap((variant) => generateColorRules(variant, useColors, useMapping, this.#adapter))
			.reduce((acc, { key, value }) => ({ ...acc, [key]: value }), {})
		return rules
	}

	/**
	 * Returns the named-token layer as a map of `--{name}: <resolved value>` entries.
	 *
	 * Palette values are inlined — there is no `var(--color-{role}-{shade})` indirection.
	 *
	 * `on-primary` is derived: it picks the paper shade (50) of the surface palette so the
	 * default contrast pair is "primary fill + white-ish text." Skins that need a different
	 * pair should override via custom tokens.
	 *
	 * `*-soft` variants resolve to shade 100 of their role's palette.
	 * `shadow-tint` resolves to shade 900 of the ink palette.
	 *
	 * @param {'light' | 'dark'} _mode — accepted for symmetry with future
	 *   dark-aware derivations. Today the Theme is constructed with a mode-resolved
	 *   mapping, so this parameter is informational.
	 */
	getNamedTokens(_mode = 'light') {
		const colors = { ...defaultColors, ...this.#colors }
		const result: Record<string, string> = {}

		for (const name of NAMED_TOKENS) {
			const role = NAMED_TOKEN_ROLE_MAP[name]
			const shadeOrDerived = NAMED_TOKEN_SHADE_MAP[name]
			const paletteName = this.#mapping[role]
			if (!paletteName || !colors[paletteName]) continue

			const value = shadeOrDerived === 'derived'
				? this.#resolveDerivedToken(name, colors)
				: this.#adapter.wrap(colors[paletteName][String(shadeOrDerived)])

			if (value !== undefined) result[`--${name}`] = value
		}
		return result
	}

	/**
	 * Resolves a 'derived' named token. Today only `on-primary` is derived — it picks
	 * shade 50 from the surface palette for the default white-on-primary contrast pair.
	 */
	#resolveDerivedToken(name: string, colors: Record<string, Record<string, string>>): string | undefined {
		if (name === 'on-primary') {
			const surfacePaletteName = this.#mapping['surface']
			const surfacePalette = colors[surfacePaletteName]
			if (surfacePalette?.['50']) {
				return this.#adapter.wrap(surfacePalette['50'])
			}
		}
		return undefined
	}

	getShortcuts(name) {
		return [...semanticShortcuts(name), ...contrastShortcuts(name)]
	}

	/**
	 * Generates CSS custom property declarations for the semantic z0–z10 tone scale.
	 *
	 * Returns a CSS string with two blocks:
	 * - `:root` — light-mode aliases (z0=50 … z10=950)
	 * - `[data-mode="dark"]` — dark-mode aliases (z0=950 … z10=50)
	 *
	 * These let consumers write `var(--color-primary-z5)` instead of hardcoding
	 * numeric shades, and the value automatically adapts to the active mode.
	 */
	getZScaleCSS() {
		const names = Object.keys(this.#mapping)

		const lightLines = names.flatMap((name) =>
			Object.entries(TONE_MAP).map(([zone, light]) => {
				const value = INVERTED_ROLES.has(name) ? 1000 - light : light
				return `  --color-${name}-${zone}: var(--color-${name}-${value});`
			})
		)

		const darkLines = names.flatMap((name) =>
			Object.entries(TONE_MAP).map(([zone, light]) => {
				const dark = 1000 - light
				const value = INVERTED_ROLES.has(name) ? light : dark
				return `  --color-${name}-${zone}: var(--color-${name}-${value});`
			})
		)

		return `:root {\n${lightLines.join('\n')}\n}\n[data-mode="dark"] {\n${darkLines.join('\n')}\n}`
	}
}

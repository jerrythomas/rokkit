// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { DEFAULT_THEME_MAPPING, defaultColors } from './constants'
import { shades } from './colors/index'
import { ColorSpace, relativeLuminance } from './color-space'
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

/**
 * Generates "on-color" text shortcuts for readable text on colored backgrounds.
 *
 * The on-color is whichever of near-black / near-white best contrasts with the
 * role's z5 fill (the principle: a 500-shade fill takes black OR white text —
 * never a mid tint, which fails AA on bright fills like vermillion). The caller
 * passes the resolved on-color hex (see `Theme.#onColorHex`); we emit it as an
 * arbitrary-value utility so it stays a single CSS color, opacity-composable.
 *
 * - `text-on-{name}` → readable text on a z5+ fill
 * - `text-on-{name}-muted` → same on-color (kept for back-compat callers)
 *
 * @param {string} name - Color name (e.g., 'primary', 'accent', 'danger')
 * @param {string} [onColor='#fafafa'] - resolved on-color hex for this role
 * @returns {Array} Array of shortcut definitions
 */
export function contrastShortcuts(name, onColor = '#fafafa') {
	return [
		[new RegExp(`^text-on-${name}(\\/\\d+)?$`), ([, end]) => `text-[${onColor}]${end || ''}`],
		[new RegExp(`^text-on-${name}-muted(\\/\\d+)?$`), ([, end]) => `text-[${onColor}]${end || ''}`]
	]
}

/**
 * Near-black / near-white on-color endpoints. Not pure #000/#fff — a hair of
 * lift reads softer on a saturated fill while still clearing AA (near-black is
 * dark enough that even a mid-bright vermillion 500 reaches ~5:1).
 */
const ON_COLOR_DARK = '#161616'
const ON_COLOR_LIGHT = '#fafafa'
/**
 * Fill luminance where ON_COLOR_DARK and ON_COLOR_LIGHT give equal WCAG contrast:
 * solve (Yf+0.05)² = (Y_dark+0.05)(Y_light+0.05) with Y_dark≈0.0074, Y_light≈0.956
 * → Yf ≈ 0.190. Fills at/above this take dark text; below take light text. (Truly
 * mid-luminance fills near this point clear neither pair at AA — that's the
 * palette author's choice to make, per "pick a 500 where black or white works".)
 */
const ON_COLOR_Y_CROSSOVER = 0.19

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
	 * @param perRoleModes — optional map of role → 'core' | 'extended'. When a token's
	 *   role is 'extended', the value is a `var(--color-{role}-{shade})` alias instead
	 *   of the inlined palette value. Defaults to 'core' for all unspecified roles
	 *   (and for the whole map when undefined).
	 */
	getNamedTokens(_mode = 'light', perRoleModes?: Record<string, 'core' | 'extended'>) {
		const colors = { ...defaultColors, ...this.#colors }
		const result: Record<string, string> = {}
		for (const name of NAMED_TOKENS) {
			const value = this.#resolveNamedToken(name, colors, perRoleModes)
			if (value !== undefined) result[`--${name}`] = value
		}
		return result
	}

	/**
	 * Resolves a single named token to its CSS value, respecting per-role mode.
	 * Returns undefined when the role's palette is missing.
	 */
	#resolveNamedToken(name: string, colors: Record<string, Record<string, string>>, perRoleModes?: Record<string, 'core' | 'extended'>): string | undefined {
		const role = NAMED_TOKEN_ROLE_MAP[name]
		const shadeOrDerived = NAMED_TOKEN_SHADE_MAP[name]
		const paletteName = this.#mapping[role]
		if (!paletteName || !colors[paletteName]) return undefined
		if (shadeOrDerived === 'derived') return this.#resolveDerivedToken(name, colors, perRoleModes)
		return this.#resolveShadeToken(role, shadeOrDerived as number, colors[paletteName], perRoleModes)
	}

	/**
	 * Resolves a shade-based named token value in either core (inline) or extended (alias) mode.
	 */
	#resolveShadeToken(role: string, shade: number, palette: Record<string, string>, perRoleModes?: Record<string, 'core' | 'extended'>): string | undefined {
		const roleMode = perRoleModes?.[role] ?? 'core'
		if (roleMode === 'extended') return `var(--color-${role}-${shade})`
		const raw = palette[String(shade)]
		return raw !== undefined ? this.#adapter.wrap(raw) : undefined
	}

	/**
	 * Resolves a 'derived' named token. Today only `on-primary` is derived — it's
	 * the auto on-color (near-black or near-white) for the primary fill, so the
	 * default pair always clears AA whether primary-500 is bright (→ black) or
	 * dark (→ white). Skins still override `on-primary` for a bespoke pair.
	 */
	#resolveDerivedToken(name: string, colors: Record<string, Record<string, string>>, _perRoleModes?: Record<string, 'core' | 'extended'>): string | undefined {
		if (name === 'on-primary') {
			return this.#adapter.wrap(this.#onColorHex('primary', colors))
		}
		/* v8 ignore next -- on-primary is the only 'derived' token, so this default is unreachable */
		return undefined
	}

	/**
	 * Picks the readable on-color (near-black / near-white hex) for a role's z5
	 * fill by its relative luminance. Bright fills (vermillion, teal, amber) take
	 * dark text; dark fills (violet, indigo) take light text. Falls back to light
	 * when the fill can't be measured (matches the historical default).
	 */
	#onColorHex(role: string, colors: Record<string, Record<string, string>>): string {
		const palette = colors[this.#mapping[role]]
		const fill = palette?.['500']
		const y = fill !== undefined ? relativeLuminance(fill, this.#adapter.name) : null
		if (y === null) return ON_COLOR_LIGHT
		return y >= ON_COLOR_Y_CROSSOVER ? ON_COLOR_DARK : ON_COLOR_LIGHT
	}

	#surfaceInkAlias(role: 'surface' | 'ink'): Record<string, string> {
		return { [`--color-${role}`]: role === 'surface' ? 'var(--paper)' : 'var(--ink)' }
	}

	#otherRoleAlias(role: string): Record<string, string> {
		return { [`--color-${role}`]: `var(--${role})` }
	}

	/** Bare `--color-{role}` alias backing preset-wind3 utilities (from-/to-/divide-) in core mode. */
	getRoleBaseAlias(role: string): Record<string, string> {
		if (role === 'surface' || role === 'ink') return this.#surfaceInkAlias(role)
		return this.#otherRoleAlias(role)
	}

	/**
	 * Returns named tokens as CSS-var aliases pointing at the palette layer.
	 * Used in extended mode where the preset emits the full --color-{role}-{shade}
	 * palette; named tokens become thin syntactic aliases over the palette.
	 *
	 * `on-primary` resolves to the auto on-color for the primary fill (near-black
	 * or near-white), matching the core-mode derivation.
	 */
	getZAliasesForExtended(): Record<string, string> {
		const colors = { ...defaultColors, ...this.#colors }
		const result: Record<string, string> = {}
		for (const name of NAMED_TOKENS) {
			const role = NAMED_TOKEN_ROLE_MAP[name]
			const shadeOrDerived = NAMED_TOKEN_SHADE_MAP[name]
			if (shadeOrDerived === 'derived') {
				// on-primary → auto on-color (black/white) for the primary fill
				result[`--${name}`] = this.#adapter.wrap(this.#onColorHex('primary', colors))
				continue
			}
			result[`--${name}`] = `var(--color-${role}-${shadeOrDerived})`
		}
		return result
	}

	/**
	 * Emit the full --color-{role}-{shade} palette CSS vars for a single role.
	 * Mirrors what getPalette does for all roles, but scoped to one.
	 */
	getPaletteForRole(role: string): Record<string, string> {
		const colors = { ...defaultColors, ...this.#colors }
		const paletteName = this.#mapping[role]
		if (!paletteName || !colors[paletteName]) return {}
		const palette = colors[paletteName]
		const result: Record<string, string> = {}
		for (const shade of shades) {
			if (palette[shade] !== undefined) {
				result[`--color-${role}-${shade}`] = this.#adapter.wrap(palette[shade])
			}
		}
		return result
	}

	getShortcuts(name) {
		const colors = { ...defaultColors, ...this.#colors }
		return contrastShortcuts(name, this.#onColorHex(name, colors))
	}

}

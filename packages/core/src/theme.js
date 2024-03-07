import { defaultThemeMapping, defaultColors, syntaxColors } from './constants'
import { shades, defaultPalette } from './colors'

const modifiers = {
	hsl: (value) => `hsl(${value})`,
	rgb: (value) => `rgb(${value})`,
	none: (value) => value
}

/**
 * Generate shades for a color using css varuable
 *
 * @param {string} name
 * @returns
 */
export function shadesOf(name, modifier = 'none') {
	const fn = modifier in modifiers ? modifiers[modifier] : modifiers.none

	return shades.reduce(
		(result, shade) => ({
			...result,
			[shade]: fn(`var(--${name}-${shade})`)
		}),
		{
			DEFAULT: fn(`var(--${name}-500)`),
			base: fn(`var(--${name}-50)`),
			inset: fn(`var(--${name}-100)`),
			subtle: fn(`var(--${name}-200)`),
			muted: fn(`var(--${name}-300)`),
			raised: fn(`var(--${name}-400)`),
			elevated: fn(`var(--${name}-600)`),
			floating: fn(`var(--${name}-700)`),
			contrast: fn(`var(--${name}-800)`)
		}
	)
}

export function stateColors(name, modifier = 'none') {
	const fn = modifier in modifiers ? modifiers[modifier] : modifiers.none
	return {
		DEFAULT: fn(`var(--${name}-500)`),
		light: fn(`var(--${name}-200)`),
		dark: fn(`var(--${name}-700)`)
	}
}

export function themeColors(modifier = 'none') {
	const fn = modifier in modifiers ? modifiers[modifier] : modifiers.none

	let states = ['info', 'danger', 'warning', 'success', 'error']
	let variants = ['neutral', 'primary', 'secondary', 'accent']
	let colors = states.reduce(
		(acc, state) => ({ ...acc, [state]: stateColors(state, modifier) }),
		{}
	)
	colors = variants.reduce(
		(acc, variant) => ({ ...acc, [variant]: shadesOf(variant, modifier) }),
		colors
	)
	colors.neutral = {
		...colors.neutral,
		// contrast: fn(`var(--neutral-800)`),
		zebra: fn(`var(--neutral-zebra)`)
	}

	return colors
}

export function contrastColors(light = '#ffffff', dark = '#000000', palette = defaultPalette) {
	const colors = palette
		.flatMap((variant) => [
			shades.map((shade) => ({
				key: `--on-${variant}-${shade}`,
				value: shade < 500 ? dark : light,
				mode: 'light'
			})),
			shades.map((shade) => ({
				key: `--on-${variant}-${shade}`,
				value: shade > 500 ? dark : light,
				mode: 'dark'
			}))
		])
		.reduce((acc, item) => [...acc, ...item], [])
	return colors
}
/**
 * Generates color rules for a specific theme variant, for both light and dark modes.
 *
 * @param {string} variant - The name of the variant to generate rules for.
 * @param {Object} colors - The object containing color definitions.
 * @param {Object} mapping - An object that maps variant names to color property names.
 * @returns {Array<Object>} An array containing the color rules for both light and dark modes.
 */
function generateColorRules(variant, colors, mapping) {
	return shades.flatMap((shade, index) => [
		{
			key: `--${variant}-${shade}`,
			value: colors[mapping[variant]][shade],
			mode: 'light'
		},
		{
			key: `--${variant}-${shade}`,
			value: colors[mapping[variant]][shades[shades.length - index - 1]],
			mode: 'dark'
		}
	])
}

/**
 * Filters the rules for a specific mode and transforms them into an object mapping
 * CSS variable names to their values.
 *
 * @param {Array<Object>} rules - The array of rules to filter and transform.
 * @param {'light' | 'dark'} mode - The mode to filter by.
 * @returns {Object} An object containing the rules specific to the provided mode.
 */
function filterRulesByMode(rules, mode) {
	return rules
		.filter((rule) => rule.mode === mode)
		.reduce((acc, { key, value }) => ({ ...acc, [key]: value }), {})
}

/**
 * Creates a theme variant object with a given mode, a collection of color rules, and additional colors.
 *
 * @param {string} name - The base name for the theme variant.
 * @param {'light' | 'dark'} mode - The mode of the theme variant.
 * @param {Object} colors - The object containing color rules for the theme.
 * @param {Object} extraColors - Any additional color properties for the theme.
 * @returns {Array} An array where the first element is the theme's name and the second element
 * is an object containing all color rules and extra properties for the theme variant.
 */
function createThemeVariant(name, mode, colors, extraColors) {
	return [
		`${name}-mode-${mode}`,
		{
			...colors,
			...extraColors,
			'--plot-background': 'var(--neutral-200)'
		}
	]
}

/**
 * Constructs and returns the light and dark theme variants based on provided color mapping and color definitions.
 *
 * @param {string} name - The base name for the theme, defaults to 'rokkit' if not provided.
 * @param {Object} [mapping=defaultThemeMapping] - An object mapping variant names to color property names.
 * @param {Object} [colors=defaultColors] - The object containing default color definitions.
 * @returns {Array<Array>} An array containing two arrays, one for the light theme variant and another for the dark theme.
 */
export function themeRules(name = 'rokkit', mapping = defaultThemeMapping, colors = defaultColors) {
	mapping = { ...defaultThemeMapping, ...mapping }
	const variants = Object.keys(mapping)

	const rules = variants.reduce(
		(acc, variant) => [...acc, ...generateColorRules(variant, colors, mapping)],
		[]
	)

	const lightRules = filterRulesByMode(rules, 'light')
	const darkRules = filterRulesByMode(rules, 'dark')

	const lightTheme = createThemeVariant(name, 'light', lightRules, syntaxColors['one-dark'].light)
	const darkTheme = createThemeVariant(name, 'dark', darkRules, syntaxColors['one-dark'].dark)

	return [lightTheme, darkTheme]
}

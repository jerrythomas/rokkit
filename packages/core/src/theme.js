import { defaultThemeMapping, defaultColors, syntaxColors, TONE_MAP } from './constants.js'
import { shades, defaultPalette } from './colors/index.js'
import { hex2rgb } from './utils'

const modifiers = {
	hsl: (value) => `hsl(${value} / <alpha-value>)`,
	rgb: (value) => `rgb(${value} / <alpha-value>)`
}

/**
 * Generate shades for a color using css varuable
 *
 * @param {string} name
 * @param {string} modifier
 * @returns
 */
export function shadesOf(name, modifier = 'rgb') {
	const fn = modifier in modifiers ? modifiers[modifier] : modifiers.rgb

	return shades.reduce(
		(result, shade) => ({
			...result,
			[shade]: fn(`var(--${name}-${shade})`)
		}),
		{
			DEFAULT: fn(`var(--${name}-500)`)
		}
	)
}

/**
 * Generate shades for a color using css varuable
 *
 * @param {string} name
 * @param {string} modifier
 * @returns {object}
 */
export function stateColors(name, modifier = 'rgb') {
	const fn = modifier in modifiers ? modifiers[modifier] : modifiers.rgb
	return {
		DEFAULT: fn(`var(--${name}-500)`),
		light: fn(`var(--${name}-200)`),
		dark: fn(`var(--${name}-700)`)
	}
}

/**
 *
 * @param {string} modifier
 * @returns
 */
export function themeColors(modifier = 'rgb') {
	// const fn = modifier in modifiers ? modifiers[modifier] : modifiers.rgb

	const states = ['info', 'danger', 'warning', 'success', 'error']
	const variants = ['neutral', 'primary', 'secondary', 'accent']
	let colors = states.reduce(
		(acc, state) => ({ ...acc, [state]: stateColors(state, modifier) }),
		{}
	)
	colors = variants.reduce(
		(acc, variant) => ({ ...acc, [variant]: shadesOf(variant, modifier) }),
		colors
	)

	return colors
}

/**
 * Creates an array of shade mapping objects for a given theme variant and mode.
 * Each object represents a CSS custom property (variable) with its value set based on a provided condition.
 *
 * @param {string}                   variant        - The name of the theme variant (e.g., 'primary', 'secondary').
 being created.
 * @param {function(number): string} valueCondition - A function that takes a shade value and returns the color value
 *                                                    based on the condition appropriate for light or dark mode.
 * @returns {{import('./types'}.ShadeMapping[]>} An array of objects, where each object contains key, value, and mode
 *                                              properties corresponding to  a CSS custom property definition.
 */
function createShadeMappings(variant, valueCondition) {
	return shades.map((shade) => ({
		key: `--on-${variant}-${shade}`,
		value: valueCondition(shade)
	}))
}

/**
 * Generates contrast colors for light and dark modes based on a given palette. Each color variant in the
 * palette is mapped to either a light or dark contrast color depending on the shade's value.
 *
 * @param {string} [light='#ffffff'] - The default light color used when the shade is >= 500 in light mode or <= 500 in dark mode.
 * @param {string} [dark='#000000'] - The default dark color used when the shade is < 500 in light mode or > 500 in dark mode.
 * @param {Array<string>} [palette=defaultPalette] - An array of color variant names to generate contrast colors for.
 * @returns {Array<Object>} An array containing contrast color rules organized by light and dark modes for each variant in the palette.
 */
export function contrastColors(light = '#ffffff', dark = '#000000', palette = defaultPalette) {
	const colors = palette
		.flatMap((variant) => [createShadeMappings(variant, (shade) => (shade < 500 ? dark : light))])
		.reduce((acc, item) => [...acc, ...item], [])
	return colors
}
/**
 * Generates color rules for a specific theme variant, for both light and dark modes.
 *
 * @param {string} variant - The name of the variant to generate rules for.
 * @param {Object} colors - The object containing color definitions.
 * @param {Object} mapping - An object that maps variant names to color property names.
 * @returns {import('./types').ShadeMappings} An array containing the color rules for both light and dark modes.
 */
function generateColorRules(variant, colors, mapping) {
	return shades.flatMap((shade) => [
		{
			key: `--${variant}-${shade}`,
			value: hex2rgb(colors[mapping[variant]][shade])
		}
	])
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
		`${name}-${mode}`,
		{
			...colors,
			...extraColors
		}
	]
}

/**
 * Constructs and returns the light and dark theme variants based on provided color mapping and color definitions.
 *
 * @param {string} name                          - The base name for the theme, defaults to 'rokkit' if not provided.
 * @param {Object} [mapping=defaultThemeMapping] - An object mapping variant names to color property names.
 * @param {Object} [colors=defaultColors]        - The object containing default color definitions.
 * @returns {Array<Array>} An array containing two arrays, one for the light theme variant and another for the dark theme.
 */
export function themeRules(name = 'rokkit', mapping = defaultThemeMapping, colors = defaultColors) {
	mapping = { ...defaultThemeMapping, ...mapping }
	const variants = Object.keys(mapping)
	const rules = variants
		.flatMap((variant) => generateColorRules(variant, { ...defaultColors, ...colors }, mapping))
		.reduce((acc, { key, value }) => ({ ...acc, [key]: value }), {})

	const lightTheme = createThemeVariant(name, 'colors', rules)

	return [lightTheme]
}

/**
 * Generates UnoCSS shortcut definitions for semantic tones with bg, border, text.
 * @param {string} name - Color name (e.g., 'primary')
 * @returns {Array} Array of shortcut definitions
 */
export function semanticShortcuts(name) {
	const prefixes = ['bg', 'border', 'text', 'ring', 'outline', 'from', 'to', 'divide']
	const shortcuts = []

	for (const [toneName, lightValue] of Object.entries(TONE_MAP)) {
		const darkValue = 1000 - lightValue

		for (const prefix of prefixes) {
			// Variant-prefixed regex (e.g., hover:bg-primary-base)
			const variantPattern = new RegExp(`^(.+):${prefix}-${name}-${toneName}$`)
			shortcuts.push([
				variantPattern,
				([, variant]) =>
					`${variant}:${prefix}-${name}-${lightValue} ${variant}:dark:${prefix}-${name}-${darkValue}`
			])

			// Exact static shortcut (e.g., bg-primary-base)
			const exactPattern = `${prefix}-${name}-${toneName}`
			shortcuts.push([
				exactPattern,
				`${prefix}-${name}-${lightValue} dark:${prefix}-${name}-${darkValue}`
			])
		}
	}

	return shortcuts
}

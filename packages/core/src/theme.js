import { defaultThemeMapping, defaultColors, TONE_MAP } from './constants.js'
import { shades } from './colors/index.js'
import { hex2rgb } from './utils'

const modifiers = {
	hsl: (value) => `hsl(${value} / <alpha-value>)`,
	rgb: (value) => `rgb(${value} / <alpha-value>)`,
	none: (value) => value
}

/**
 * Generate shades for a color using css varuable
 *
 * @param {string} name
 * @param {string} modifier
 * @returns
 */
export function shadesOf(name, modifier = 'none') {
	const fn = modifier in modifiers ? modifiers[modifier] : modifiers.none

	return shades.reduce(
		(result, shade) => ({
			...result,
			[shade]: fn(`var(--color-${name}-${shade})`)
		}),
		{
			DEFAULT: fn(`var(--color-${name}-500)`)
		}
	)
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
	return ['DEFAULT', ...shades].flatMap((shade) => [
		{
			key: shade === 'DEFAULT' ? `--color-${variant}` : `--color-${variant}-${shade}`,
			value: hex2rgb(colors[mapping[variant]][`${shade}`])
		}
	])
}

/**
 * Constructs and returns the light and dark theme variants based on provided color mapping and color definitions.
 *
 * @param {Object} [mapping=defaultThemeMapping] - An object mapping variant names to color property names.
 * @param {Object} [colors=defaultColors]        - The object containing default color definitions.
 * @returns {Array<Array>} An array containing two arrays, one for the light theme variant and another for the dark theme.
 */
export function themeRules(mapping = defaultThemeMapping, colors = defaultColors) {
	mapping = { ...defaultThemeMapping, ...mapping }
	colors = { ...defaultColors, ...colors }
	const variants = Object.keys(mapping)
	const rules = variants
		.flatMap((variant) => generateColorRules(variant, colors, mapping))
		.reduce((acc, { key, value }) => ({ ...acc, [key]: value }), {})

	return rules
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
			const variantPattern = new RegExp(`^(.+):${prefix}-${name}-${toneName}(\/\\d+)?$`)
			shortcuts.push([
				variantPattern,
				([, variant, end]) =>
					`${variant}:${prefix}-${name}-${lightValue}${end || ''} ${variant}:dark:${prefix}-${name}-${darkValue}${end || ''}`
			])

			const opacityPattern = new RegExp(`${prefix}-${name}-${toneName}(\/\\d+)?$`)
			shortcuts.push([
				opacityPattern,
				([, end]) =>
					`${prefix}-${name}-${lightValue}${end || ''} dark:${prefix}-${name}-${darkValue}${end || ''}`
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

/**
 * Theme class for managing color palettes, mappings, and semantic shortcuts.
 */
export class Theme {
	#colors
	#mapping

	/**
	 *
	 * @param {import('./types.js').ColorTheme} param0
	 */
	constructor({ colors = defaultColors, mapping = defaultThemeMapping } = {}) {
		this.#colors = { ...defaultColors, ...colors }
		this.#mapping = { ...defaultThemeMapping, ...mapping }
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
		this.#mapping = { ...mapping }
	}

	mapVariant(color, variant) {
		return Object.keys(color).reduce(
			(acc, key) => ({
				...acc,
				[key]:
					key === 'DEFAULT'
						? `rgba(var(--color-${variant}),<alpha-value>)`
						: `rgba(var(--color-${variant}-${key}),<alpha-value>)`
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
			.flatMap((variant) => generateColorRules(variant, useColors, useMapping))
			.reduce((acc, { key, value }) => ({ ...acc, [key]: value }), {})
		return rules
	}

	getShortcuts(name) {
		return semanticShortcuts(name)
	}
}

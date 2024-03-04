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

export function themeRules(name = 'rokkit', mapping = defaultThemeMapping, colors = defaultColors) {
	mapping = { ...defaultThemeMapping, ...mapping }
	const variants = Object.keys(mapping)
	const rules = variants
		.flatMap((variant) => [
			shades.map((shade) => ({
				key: `--${variant}-${shade}`,
				value: colors[mapping[variant]][shade],
				mode: 'light'
			})),
			shades.map((shade, i) => ({
				key: `--${variant}-${shade}`,
				value: colors[mapping[variant]][shades[shades.length - i - 1]],
				mode: 'dark'
			}))
		])
		.reduce((acc, item) => [...acc, ...item], [])

	const light = rules
		.filter((rule) => rule.mode === 'light')
		.reduce((acc, item) => ({ ...acc, [item.key]: item.value }), {})
	const dark = rules
		.filter((rule) => rule.mode === 'dark')
		.reduce((acc, item) => ({ ...acc, [item.key]: item.value }), {})

	return [
		[
			`${name}-mode-light`,
			{
				...light,
				...syntaxColors['one-dark'].light,
				'--plot-background': 'var(--neutral-200)'
			}
		],
		[
			`${name}-mode-dark`,
			{
				...dark,
				...syntaxColors['one-dark'].dark,
				'--plot-background': 'var(--neutral-200)'
			}
		]
	]
}

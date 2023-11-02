import { defaultThemeMapping, defaultColors, syntaxColors } from './constants'

const modifiers = {
	hsl: (value) => `hsl(${value})`,
	rgb: (value) => `rgb(${value})`,
	none: (value) => value
}

export function id() {
	return Math.random().toString(36).substr(2, 9)
}

/**
 * Generate shades for a color using css varuable
 *
 * @param {string} name
 * @returns
 */
export function shadesOf(name, modifier = 'none') {
	const shades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900]
	const fn = modifier in modifiers ? modifiers[modifier] : modifiers.none

	return shades.reduce(
		(result, shade) => ({
			...result,
			[shade]: fn(`var(--${name}-${shade})`)
		}),
		{
			DEFAULT: fn(`var(--${name}-500)`),
			inset: fn(`var(--${name}-50)`),
			sunken: fn(`var(--${name}-50)`),
			recessed: fn(`var(--${name}-50)`),
			base: fn(`var(--${name}-100)`),
			subtle: fn(`var(--${name}-200)`),
			muted: fn(`var(--${name}-300)`),
			raised: fn(`var(--${name}-400)`),
			elevated: fn(`var(--${name}-500)`),
			floating: fn(`var(--${name}-600)`),
			contrast: fn(`var(--${name}-700)`)
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

	let states = ['info', 'error', 'warn', 'pass']
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
		contrast: fn(`var(--neutral-800)`),
		zebra: fn(`var(--neutral-zebra)`)
	}

	return colors
}

export function iconShortcuts(icons, collection, variants) {
	const suffix = variants ? `-${variants}` : ''
	const shortcuts = !collection
		? {}
		: icons.reduce(
				(acc, name) => ({
					...acc,
					[name]: [collection, name].join(':') + suffix
				}),
				{}
		  )

	return shortcuts
}

export function scaledPath(size, x) {
	if (Array.isArray(x)) return x.map((x) => scaledPath(size, x)).join(' ')
	return typeof x === 'number' ? x * size : x
}

export function themeRules(name = 'rokkit', mapping = defaultThemeMapping, colors = defaultColors) {
	const shades = ['50', 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]
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
				...syntaxColors['one-dark'].light
			}
		],
		[
			`${name}-mode-dark`,
			{
				...dark,
				...syntaxColors['one-dark'].dark
			}
		]
	]
}

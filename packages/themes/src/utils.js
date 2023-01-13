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
	const shades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900]
	const fn = modifier in modifiers ? modifiers[modifier] : modifier.none

	return shades.reduce(
		(result, shade) => ({
			...result,
			[shade]: fn(`var(--${name}-${shade})`)
		}),
		{ DEFAULT: fn(`var(--${name}-500)`) }
	)
}

export function stateColors(name, modifier = 'none') {
	const fn = modifier in modifiers ? modifiers[modifier] : modifier.none
	return {
		DEFAULT: fn(`var(--${name}-500)`),
		light: fn(`var(--${name}-100)`),
		dark: fn(`var(--${name}-800)`)
	}
}

export function themeColors(modifier = 'none') {
	const fn = modifier in modifiers ? modifiers[modifier] : modifier.none

	let states = ['info', 'error', 'warn', 'pass']
	let variants = ['skin', 'primary', 'secondary', 'accent']
	let colors = states.reduce(
		(acc, state) => ({ ...acc, [state]: stateColors(state, modifier) }),
		{}
	)
	colors = variants.reduce(
		(acc, variant) => ({ ...acc, [variant]: shadesOf(variant, modifier) }),
		colors
	)

	colors.skin = {
		...colors.skin,
		contrast: fn(`var(--skin-800)`),
		base: fn(`var(--skin-100)`),
		zebra: fn(`var(--skin-zebra)`)
	}

	return colors
}

export function stateIconsFromNames(icons) {
	return Object.entries(icons)
		.map(([k, v]) => [...k.split('-'), v])
		.reduce(
			(acc, [element, state, icon]) => ({
				...acc,
				[element]: { ...acc[element], [state]: icon }
			}),
			{}
		)
}

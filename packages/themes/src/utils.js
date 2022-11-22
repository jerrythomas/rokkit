/**
 * Generate shades for a color using css varuable
 *
 * @param {string} name
 * @returns
 */
export function shadesOf(name) {
	const shades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900]

	return shades.reduce(
		(result, shade) => ({
			...result,
			[shade]: `hsl(var(--${name}-${shade}))`
		}),
		{ DEFAULT: `hsl(var(--${name}-500))` }
	)
}

export function stateColors(name) {
	return {
		DEFAULT: `hsl(var(--${name}-500))`,
		light: `hsl(var(--${name}-100))`,
		dark: `hsl(var(--${name}-800))`
	}
}

export function themeColors() {
	let states = ['info', 'error', 'warn', 'pass']
	let variants = ['skin', 'primary', 'secondary', 'accent']

	let colors = states.reduce(
		(acc, state) => ({ ...acc, [state]: stateColors(state) }),
		{}
	)
	colors = variants.reduce(
		(acc, variant) => ({ ...acc, [variant]: shadesOf(variant) }),
		colors
	)

	colors.skin = {
		...colors.skin,
		contrast: `hsl(var(--skin-800))`,
		base: `hsl(var(--skin-100))`,
		zebra: `hsl(var(--skin-zebra))`
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

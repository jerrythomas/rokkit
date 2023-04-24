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
	// console.log('colors', colors)
	colors.skin = {
		...colors.skin,
		contrast: fn(`var(--skin-800)`),
		zebra: fn(`var(--skin-zebra)`)
	}

	return colors
}

// export function stateIconsFromNames(names) {
// 	return names
// 		.map((k) => [...k.split('-'), k])
// 		.reduce(
// 			(acc, [element, state, icon]) => ({
// 				...acc,
// 				[element]: { ...acc[element], [state]: icon }
// 			}),
// 			{}
// 		)
// }

export function iconShortcuts(icons, collection, variant = '') {
	const prefix = collection ? collection + ':' : ''
	const suffix = variant ? '-' + variant : ''

	const shortcuts = icons.reduce(
		(acc, name) => ({
			...acc,
			[name]:
				prefix +
				(name.startsWith('selector')
					? 'chevron-sort'
					: name.replace('rating', 'star').replace('navigate', 'chevron')) +
				suffix
		}),
		{}
	)

	return shortcuts
}

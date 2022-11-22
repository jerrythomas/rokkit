/**
 *
 * @param {string} name
 * @returns
 */
export function hslFromVariable(name) {
	const shades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900]

	return shades.reduce(
		(result, shade) => ({
			...result,
			[shade]: `hsl(var(--${name}-${shade}))`
		}),
		{ DEFAULT: `hsl(var(--${name}-500))` }
	)
}

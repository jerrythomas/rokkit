export const defaultIcons = {
	'checkbox-checked': 'i-fluent-checkbox-checked-24-filled',
	'checkbox-unchecked': 'i-fluent-checkbox-unchecked-24-filled',
	'checkbox-unknown': 'i-fluent-checkbox-indeterminate-24-filled',
	'rating-empty': 'i-carbon-star',
	'rating-half': 'i-carbon-star-half',
	'rating-filled': 'i-carbon-star-filled',
	'radio-off': 'i-carbon-radio-button',
	'radio-on': 'i-carbon-radio-button-checked',
	'accordion-opened': 'i-carbon-chevron-down',
	'accordion-closed': 'i-carbon-chevron-right',
	'close-outline': 'i-carbon-close-outline',
	'close-filled': 'i-carbon-close-filled',
	'delete-outline': 'i-carbon-trash-can',
	'theme-light': 'i-carbon-sun',
	'theme-dark': 'i-carbon-moon',
	'node-opened': 'i-eva-minus-square-outline',
	'node-closed': 'i-eva-plus-square-outline'
}

export const defaultStateIcons = stateIconsFromNames(defaultIcons)

export function stateIconsFromNames(names) {
	return Object.keys(names)
		.map((v) => [...v.split('-'), v])
		.reduce(
			(acc, [element, state, icon]) => ({
				...acc,
				[element]: { ...acc[element], [state]: icon }
			}),
			{}
		)
}

export function themeColors() {
	let states = ['info', 'error', 'warn', 'pass']
	let variants = ['skin', 'primary', 'secondary', 'accent']

	let colors = states.reduce(
		(acc, state) => ({ ...acc, ...stateColors(state) }),
		{}
	)
	colors = variants.reduce(
		(acc, variant) => ({ ...acc, ...shadesOf(variant) }),
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

export function shadesOf(name) {
	let shades = Array.from({ length: 10 }, (i) => (i == 0 ? 50 : i * 100))

	return {
		[name]: shades.reduce(
			(acc, shade) => ({ ...acc, [shade]: `hsl(var(--${name}-${shade}))` }),
			{ DEFAULT: `hsl(var(--${name}-500` }
		)
	}
}

export function stateColors(name) {
	return {
		[name]: {
			DEFAULT: `hsl(var(--${name}-500))`,
			light: `hsl(var(--${name}-100))`,
			dark: `hsl(var(--${name}-800))`
		}
	}
}

export const iconShortcuts = {
	'checkbox-checked': 'i-fluent-checkbox-checked-24-filled',
	'checkbox-unchecked': 'i-fluent-checkbox-unchecked-24-filled',
	'checkbox-unknown': 'i-fluent-checkbox-indeterminate-24-filled',
	'rating-empty': 'i-carbon-star',
	'rating-half': 'i-carbon-star-half',
	'rating-filled': 'i-carbon-star-filled',
	'radio-off': 'i-carbon-radio-button',
	'radio-on': 'i-carbon-radio-button-checked',
	folder: 'i-eva-folder-fill',
	'folder-open': 'i-carbon-folder-open',
	previous: 'i-carbon-chevron-left',
	next: 'i-carbon-chevron-right',
	selector: 'i-carbon-chevron-sort',
	'accordion-opened': 'i-carbon-chevron-down',
	'accordion-closed': 'i-carbon-chevron-right',
	close: 'i-carbon-close-outline',
	'close-hover': 'i-carbon-close-filled',
	delete: 'i-carbon-trash-can',
	'theme-light': 'i-carbon-sun',
	'theme-dark': 'i-carbon-moon',
	'node-opened': 'i-eva-minus-square-outline',
	'node-closed': 'i-eva-plus-square-outline',
	'heart-filled': 'i-ant-design-heart-filled',
	'heart-outline': 'i-ant-design-heart-twotone'
}

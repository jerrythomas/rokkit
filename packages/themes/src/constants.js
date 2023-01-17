import { stateIconsFromNames, themeColors } from './utils'

export const defaultIcons = [
	'accordion-opened',
	'accordion-closed',
	'action-remove',
	'action-add',
	'action-clear',
	'action-search',
	'action-close',
	'node-opened',
	'node-closed',
	'checkbox-checked',
	'checkbox-unchecked',
	'checkbox-unknown',
	'rating-filled',
	'rating-empty',
	'rating-half',
	'radio-off',
	'radio-on',
	'folder-closed',
	'folder-opened',
	'navigate-up',
	'navigate-down',
	'navigate-left',
	'navigate-right',
	'selector-closed',
	'selector-opened',
	'mode-dark',
	'mode-light'
]

export const defaultStateIcons = stateIconsFromNames(defaultIcons)
export const defaultThemeColors = themeColors()

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

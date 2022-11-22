import { stateIconsFromNames, themeColors } from './utils'

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

export const defaultIcons = {
	'checkbox-checked': 'i-sparsh-checkbox-checked',
	'checkbox-unchecked': 'i-sparsh-checkbox-unchecked',
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
	remove: 'i-carbon-close-filled',
	select: 'i-carbon-chevron-sort',
	'delete-outline': 'i-carbon-trash-can',
	'theme-light': 'i-carbon-sun',
	'theme-dark': 'i-carbon-moon',
	'node-opened': 'i-eva-minus-square-outline',
	'node-closed': 'i-eva-plus-square-outline'
}

export const defaultStateIcons = stateIconsFromNames(defaultIcons)
export const defaultThemeColors = themeColors()

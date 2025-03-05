export { defaultColors, syntaxColors, shades, defaultPalette } from './colors/index.js'

/**
 * @type {import('./types).FieldMapping} Fields
 */
export const defaultFields = {
	id: 'id',
	url: 'url',
	text: 'text',
	value: 'value',
	children: 'children',
	icon: 'icon',
	iconPrefix: null,
	image: 'image',
	component: 'component',
	summary: 'summary',
	notes: 'notes',
	props: 'props',
	target: 'target',
	state: 'state',
	level: 'level',
	parent: 'parent',
	currency: 'currency',
	label: 'label',
	/* flag fields  */
	isSelected: '_selected',
	isHidden: '_hidden',
	isOpen: '_open',
	isDeleted: '_deleted',
	isFiltered: '_filtered'
}

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
	'selector-opened',
	'selector-closed',
	'checkbox-checked',
	'checkbox-unchecked',
	'checkbox-unknown',
	'rating-filled',
	'rating-empty',
	'rating-half',
	'radio-off',
	'radio-on',
	'mode-dark',
	'mode-light',
	'navigate-left',
	'navigate-right',
	'navigate-up',
	'navigate-down',
	'state-error',
	'state-warning',
	'state-success',
	'state-info',
	'state-unknown',
	'badge-fail',
	'badge-warn',
	'badge-pass',
	'badge-unknown',
	'sort-none',
	'sort-ascending',
	'sort-descending',
	'validity-failed',
	'validity-passed',
	'validity-unknown',
	'validity-warning'
]

export const defaultOptions = {
	id: 'id',
	label: 'label',
	value: 'value',
	checked: 'checked'
}

export const defaultKeyMap = {
	ArrowRight: 'open',
	ArrowLeft: 'close',
	ArrowDown: 'down',
	ArrowUp: 'up',
	Enter: 'select',
	Escape: 'deselect'
}

export const defaultThemeMapping = {
	neutral: 'slate',
	primary: 'orange',
	secondary: 'pink',
	accent: 'sky',
	success: 'green',
	warning: 'yellow',
	danger: 'red',
	error: 'red',
	info: 'cyan'
}

/**
 * Generate a state icon mapping from a list of icon names
 *
 * @param {string[]} icons
 * @returns {import('./types').StateIcons}
 */
export function stateIconsFromNames(icons) {
	return icons
		.map((k) => [...k.split('-')])
		.reduce(
			(acc, parts) => ({
				...acc,
				[parts[0]]: { ...acc[parts[0]], [parts[1]]: parts.join('-') }
			}),
			{}
		)
}

export const defaultStateIcons = stateIconsFromNames(defaultIcons)

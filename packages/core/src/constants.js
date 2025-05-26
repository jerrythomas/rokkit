export { defaultColors, syntaxColors, shades, defaultPalette } from './colors/index.js'
export const DATA_IMAGE_REGEX = /^data:image\/(jpeg|png|gif|bmp|webp|svg\+xml)/i
/**
 * @type {import('./types).FieldMapping} Fields
 */
export const defaultFields = {
	id: 'id',
	href: 'href',
	icon: 'icon',
	text: 'text',
	value: 'value',
	keywords: 'keywords',
	children: 'children',
	iconPrefix: null,
	image: 'image',
	summary: 'summary',
	notes: 'notes',
	props: 'props',
	target: 'target',
	state: 'state',
	level: 'level',
	parent: 'parent',
	currency: 'currency',
	label: 'label',
	component: 'component', // to be deprecated in favour of snippet
	snippet: 'snippet',
	/* flag fields  */
	deleted: '_deleted',
	expanded: '_expanded',
	selected: '_selected'
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

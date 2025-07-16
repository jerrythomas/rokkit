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
	'action-copy',
	'action-copysuccess',
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
	'validity-warning',
	'alert-clear',
	'alert-unread',
	'align-horizontal-left',
	'align-horizontal-right',
	'align-horizontal-center',
	'align-vertical-top',
	'align-vertical-bottom',
	'align-vertical-middle'
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

export const TONE_MAP = {
	z1: 50,
	z2: 100,
	z3: 200,
	z4: 300,
	z5: 500,
	z6: 600,
	z7: 700,
	z8: 800,
	z9: 900,
	z10: 950
	// base: 50,
	// inset: 100,
	// subtle: 200,
	// muted: 300,
	// raised: 400,
	// elevated: 600,
	// floating: 700,
	// contrast: 800,
	// overlay: 900
}
/**
 * Splits an icon name into its group and key components.
 * @param {string} name - The icon name to split.
 * @returns {{ group: string, key: string, value: string }} An object containing the group, key, and value of the icon name.
 */
function splitIconName(name) {
	const parts = name.split('-')
	const group = parts.slice(0, parts.length - 1).join('-')
	return { group, key: parts[parts.length - 1], value: name }
}

/**
 * Generate a state icon mapping from a list of icon names
 *
 * @param {string[]} icons
 * @returns {import('./types').StateIcons}
 */
export function stateIconsFromNames(icons) {
	return icons.map(splitIconName).reduce(
		(acc, { group, key, value }) => ({
			...acc,
			[group]: { ...acc[group], [key]: value }
		}),
		{}
	)
}

export const defaultStateIcons = stateIconsFromNames(defaultIcons)

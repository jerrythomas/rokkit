/**
 * @type {import('./types).FieldMapping} Fields
 */
export const defaultFields = {
	id: 'id',
	url: 'url',
	text: 'text',
	children: 'children',
	icon: 'icon',
	image: 'image',
	component: 'component',
	summary: 'summary',
	notes: 'notes',
	props: 'props',
	target: 'target',
	state: 'state',
	isOpen: '_open',
	isDeleted: '_deleted',
	level: 'level',
	parent: 'parent'
}

export const defaultIcons = [
	'accordion-opened',
	'accordion-closed',
	'action-remove',
	'action-add',
	'action-clear',
	'action-search',
	'action-close',
	'action-close-filled',
	'node-opened',
	'node-closed',
	'selector-opened',
	'selector-closed',
	'checkbox-checked',
	'checkbox-unchecked',
	'checkbox-unknown',
	'rating-filled',
	'rating-empty',
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
	'state-unknown'
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

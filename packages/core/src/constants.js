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
	'navigate-down'
]

// export const defaultIcons = [
// 	'accordion-opened',
// 	'accordion-closed',
// 	'action-remove',
// 	'action-add',
// 	'action-clear',
// 	'action-search',
// 	'action-close',
// 	'node-opened',
// 	'node-closed',
// 	'checkbox-checked',
// 	'checkbox-unchecked',
// 	'checkbox-unknown',
// 	'rating-filled',
// 	'rating-empty',
// 	'rating-half',
// 	'radio-off',
// 	'radio-on',
// 	'folder-closed',
// 	'folder-opened',
// 	'navigate-up',
// 	'navigate-down',
// 	'navigate-left',
// 	'navigate-right',
// 	'selector-closed',
// 	'selector-opened',
// 	'mode-dark',
// 	'mode-light'
// ]

export const defaultOptions = {
	id: 'id',
	label: 'label',
	value: 'value',
	checked: 'checked'
}

export const defaultFields = {
	id: 'id',
	url: 'url',
	text: 'text',
	data: 'data',
	icon: 'icon',
	image: 'image',
	component: 'component',
	summary: 'summary',
	notes: 'notes',
	props: 'props',
	isOpen: '_open',
	target: 'target'
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
// export const defaultStateIcons = {
// 	accordion: {
// 		opened: 'accordion-opened',
// 		closed: 'accordion-closed'
// 	},
// 	item: {
// 		remove: 'item-remove',
// 		add: 'item-add',
// 		clear: 'item-clear',
// 		search: 'item-search'
// 	},
// 	node: {
// 		opened: 'node-opened',
// 		closed: 'node-closed'
// 	},
// 	list: {
// 		selector: 'list-selector'
// 	},
// 	checkbox: {
// 		checked: 'checkbox-checked',
// 		unchecked: 'checkbox-unchecked',
// 		unknown: 'checkbox-unknown'
// 	},
// 	rating: { filled: 'rating-filled', empty: 'rating-empty' },
// 	radio: {
// 		off: 'radio-off',
// 		on: 'radio-on'
// 	}
// }

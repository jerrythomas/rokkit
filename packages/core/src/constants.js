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
	isOpen: '_open'
}

export const defaultKeyMap = {
	ArrowRight: 'open',
	ArrowLeft: 'close',
	ArrowDown: 'down',
	ArrowUp: 'up',
	Enter: 'select',
	Escape: 'deselect'
}

export const defaultIconList = [
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

export const defaultStateIcons = stateIconsFromNames(defaultIconList)
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

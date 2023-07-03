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

export const defaultOptions = {
	id: 'id',
	label: 'label',
	value: 'value',
	checked: 'checked'
}

/**
 * Structure to map custom fields for rendering
 *
 * @typedef FieldMapping
 * @property {string} [id='id']              - Unique id for the item
 * @property {string} [text='text']          - Attribute to identify the text to render
 * @property {string} [url='url']            - Attribute to identify a URL
 * @property {string} [icon='icon']          - Attribute to identify an icon class to render
 * @property {string} [image='image']        - Attribute to identify an image to render
 * @property {string} [children='children']  - Attribute to identify children of the current item
 * @property {string} [summary='summary']
 * @property {string} [notes='notes']
 * @property {string} [props='props']
 * @property {string} [isOpen='_open']       - Attribute to identify if the current item is open
 * @property {string} [level='level']        - Attribute to identify level of current item
 * @property {string} [parent='parent']      - Attribute to identify if the current item is a parent
 * @property {string} [isDeleted='_deleted'] - Attribute to identify if the current item is deleted
 * @property {FieldMapping} [fields?]        - Field mapping to be used on children in the next level
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

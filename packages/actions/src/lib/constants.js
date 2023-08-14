export const dimensionAttributes = {
	vertical: {
		scroll: 'scrollTop',
		offset: 'offsetHeight',
		paddingStart: 'paddingTop',
		paddingEnd: 'paddingBottom'
	},
	horizontal: {
		scroll: 'scrollLeft',
		offset: 'offsetWidth',
		paddingStart: 'paddingLeft',
		paddingEnd: 'paddingRight'
	}
}

export const defaultResizerOptions = {
	horizontal: false,
	minimumSize: 40,
	minimumVisible: 1,
	maximumVisible: null,
	availableSize: 200,
	start: 0
}

export const defaultVirtualListOptions = {
	itemSelector: 'virtual-list-item',
	contentSelector: 'virtual-list-content',
	enabled: true,
	horizontal: false,
	start: 0,
	limit: null,
	index: null
}

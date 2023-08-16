export const dimensionAttributes = {
	vertical: {
		scroll: 'scrollTop',
		offset: 'offsetHeight',
		paddingStart: 'paddingTop',
		paddingEnd: 'paddingBottom',
		size: 'height'
	},
	horizontal: {
		scroll: 'scrollLeft',
		offset: 'offsetWidth',
		paddingStart: 'paddingLeft',
		paddingEnd: 'paddingRight',
		size: 'width'
	}
}

export const defaultResizerOptions = {
	horizontal: false,
	minSize: 40,
	minVisible: 1,
	maxVisible: null,
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

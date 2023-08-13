const dimensionAttributes = {
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

const defaultOptions = {
	itemSelector: 'virtual-list-item',
	contentSelector: 'virtual-list-content'
}

const defaultResizerOptions = {
	horizontal: false,
	minimumSize: 40,
	minimumVisible: 1,
	maximumVisible: null,
	availableSize: 200,
	start: 0
}

export function virtualListResizer(options) {
	options = { ...defaultResizerOptions, ...options }
	const props =
		dimensionAttributes[options.horizontal ? 'horizontal' : 'vertical']
	let sizes = Array.from({ length: options.count }, () => null)
	let averageSize = options.minimumSize
	let visibleCount = options.maximumVisible
		? options.maximumVisible
		: options.minimumVisible

	let { start } = options
	let end = start + visibleCount
	let visible, before, after, total

	const calculateSum = (start, end) =>
		sizes
			.slice(start, end)
			.map((size) => size ?? averageSize)
			.reduce((sum, size) => (sum += size), 0)

	const calculate = () => {
		if (options.maximumVisible) {
			visibleCount = options.maximumVisible
		} else {
			visibleCount = Math.min(
				Math.ceil(options.availableSize / averageSize),
				sizes.length
			)

			if (visibleCount !== end - start) {
				end = start + visibleCount
			}

			visible = calculateSum(start, end)

			while (visible < options.availableSize && end < sizes.length) {
				end += 1
				visibleCount += 1
				visible += sizes[end] ?? averageSize
			}
		}
		let stop = start + visibleCount
		visible = calculateSum(start, stop)
		before = calculateSum(0, start)
		after = calculateSum(stop, sizes.length)
		total = visible + before + after
		averageSize = total / sizes.length
	}

	const update = (data) => {
		let { count, elements = [] } = data
		start = data.start || start
		end = data.end || end

		if (count > sizes.length) {
			sizes = [
				...sizes,
				...Array.from({ length: count - sizes.length }, () => null)
			]
		} else if (count < sizes.length) {
			sizes = Array.from({ length: count }, () => null)
			start = 0
		}

		elements.map((element, index) => {
			sizes[index + start] = element[props.offset]
		})
		calculate()
	}

	update(options)

	return {
		get averageSize() {
			return averageSize
		},
		get visibleCount() {
			return visibleCount
		},
		get visible() {
			return visible
		},
		get before() {
			return before
		},
		get after() {
			return after
		},
		get total() {
			return total
		},
		update
	}
}

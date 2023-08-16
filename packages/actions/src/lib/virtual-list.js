import { dimensionAttributes, defaultResizerOptions } from './constants'
import { SizeManager } from './size-manager'

export function virtualListManager(options) {
	options = { ...defaultResizerOptions, ...options }
	const props =
		dimensionAttributes[options.horizontal ? 'horizontal' : 'vertical']
	const sizeManager = new SizeManager(options.count, options.minimumSize)
	let visibleCount = options.maxVisible
		? options.maxVisible
		: options.minVisible
	let index = -1
	let delta = 0

	let { start } = options
	let end = start + visibleCount
	let visible, before, after, total

	const calculateSum = (start, end) => sizeManager.calculateSum(start, end)

	const calculate = () => {
		if (options.maxVisible) {
			visibleCount = options.maxVisible
		} else {
			visibleCount = Math.min(
				Math.ceil(options.availableSize / sizeManager.averageSize),
				options.count
			)

			if (visibleCount !== end - start) {
				end = start + visibleCount
			}

			visible = sizeManager.calculateSum(start, end)

			while (visible < options.availableSize && end < options.count) {
				end += 1
				visibleCount += 1
				visible += sizeManager.sizes[end] ?? sizeManager.averageSize
			}
		}

		visible = calculateSum(start, end)
		before = calculateSum(0, start)
		after = calculateSum(end, options.count)
		total = visible + before + after
	}

	const update = (data) => {
		let { count, elements = [] } = data
		start = data.start || start
		end = data.end || end

		sizeManager.updateCount(count ?? options.count)
		sizeManager.updateSizes(elements, props.offset, start)
		calculate()
	}

	const moveByOffset = (offset) => {
		let position = Math.max(0, Math.min(index + offset, options.count - 1))
		delta = position - index
		index = position
		if (index > end - 1) {
			end = Math.min(end + delta, options.count)
			start = end - visibleCount
		} else if (index < start) {
			start = Math.max(0, start + delta)
			end = start + visibleCount
		}
		calculate()
	}

	update(options)

	return {
		get averageSize() {
			return sizeManager.averageSize
		},
		get visibleCount() {
			return visibleCount
		},
		get visibleSize() {
			return visible
		},
		get spaceBefore() {
			return before
		},
		get spaceAfter() {
			return after
		},
		get totalSize() {
			return total
		},
		get start() {
			return start
		},
		get end() {
			return end
		},
		get index() {
			return index
		},
		get delta() {
			return delta
		},
		moveByOffset,
		next: () => moveByOffset(1),
		previous: () => moveByOffset(-1),
		nextPage: () => moveByOffset(visibleCount),
		previousPage: () => moveByOffset(-visibleCount),
		last: () => moveByOffset(options.count),
		first: () => moveByOffset(-options.count),
		update
	}
}

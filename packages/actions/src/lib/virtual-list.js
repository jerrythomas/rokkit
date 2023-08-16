import { dimensionAttributes, defaultResizerOptions } from './constants'

export function virtualListManager(options) {
	options = { ...defaultResizerOptions, ...options }
	const props =
		dimensionAttributes[options.horizontal ? 'horizontal' : 'vertical']
	let sizes = Array.from({ length: options.count }, () => null)
	let averageSize = options.minimumSize
	let visibleCount = options.maxVisible
		? options.maxVisible
		: options.minVisible
	let index = -1
	let delta = 0

	let { start } = options
	let end = start + visibleCount
	let visible, before, after, total

	const calculateSum = (start, end) =>
		calculateSumOfSizes(sizes, start, end, averageSize)

	const calculate = () => {
		if (options.maxVisible) {
			visibleCount = options.maxVisible
		} else {
			visibleCount = Math.min(
				Math.ceil(options.availableSize / averageSize),
				sizes.length
			)

			if (visibleCount !== end - start) {
				end = start + visibleCount
			}

			visible = calculateSumOfSizes(sizes, start, end, averageSize)

			while (visible < options.availableSize && end < sizes.length) {
				end += 1
				visibleCount += 1
				visible += sizes[end] ?? averageSize
			}
		}

		visible = calculateSum(start, end)
		before = calculateSum(0, start)
		after = calculateSum(end, sizes.length)
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
			return averageSize
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

function calculateSumOfSizes(sizes, start, end, averageSize) {
	return sizes
		.slice(start, end)
		.map((size) => size ?? averageSize)
		.reduce((sum, size) => (sum += size), 0)
}

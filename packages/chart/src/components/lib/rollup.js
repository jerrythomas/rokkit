import { min, max, add, format } from 'date-fns'

export function uniques(data, attr) {
	return data && attr ? [...new Set(data.map((item) => item[attr]))] : []
}

export function slidingWindow(values, size, step, offset, fmt) {
	return size && typeof size === 'object'
		? slidingWindowForDates(values, size, step, offset, fmt)
		: slidingWindowForNumbers(values, size, step, offset, fmt)
}

function slidingWindowForNumbers(values, size, step, offset = 0, fmt = 0) {
	const smallest = Number(Math.min(...values).toFixed(fmt))
	let largest = Math.max(...values)
	let count = Math.ceil((largest - smallest + offset) / step)

	if (smallest + count * step + offset == largest) {
		count += 1
	}
	// console.log('count:', count)
	const range = [...Array(count).keys()]

	const result = range.map((key) => ({
		key: smallest + key * step,
		lowerBound: smallest + key * step + offset,
		upperBound: smallest + key * step + offset + size,
	}))
	return result
}

function slidingWindowForDates(
	values,
	size,
	step,
	offset = {},
	fmt = 'yyyy-MM-dd'
) {
	const largest = max(values)
	let current = new Date(format(min(values), fmt))
	let blocks = []
	let lowerBound = current

	while (lowerBound <= largest) {
		lowerBound = add(current, offset)

		blocks.push({
			key: current,
			lowerBound,
			upperBound: add(lowerBound, size),
		})
		current = add(current, step)
	}
	return blocks
}

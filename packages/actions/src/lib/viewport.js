import { writable, get } from 'svelte/store'
import { pick } from 'ramda'
import {
	updateSizes,
	calculateSum,
	fixViewportForVisibileCount,
	fitIndexInViewport
} from './internal'

export function virtualListViewport(options) {
	let { minSize = 40, maxVisible = 0, visibleSize, gap = 0 } = options
	let current = { lower: 0, upper: 0 }
	const bounds = writable({ lower: 0, upper: 0 })
	const space = writable({
		before: 0,
		after: 0
	})
	let items
	let averageSize = minSize
	let visibleCount = maxVisible
	let value = null
	let cache = []
	let index = -1

	const update = (data) => {
		// const previous = get(bounds)

		data = {
			start: current.lower,
			end: current.upper,
			value,
			...data
		}
		items = data.items ?? items
		minSize = data.minSize ?? minSize
		maxVisible = data.maxVisible ?? maxVisible
		visibleSize = data.visibleSize ?? visibleSize

		if (items.length !== cache.length) {
			cache = Array.from({ length: items.length }).fill(null)
			if (items.length == 0) index = -1
		}
		current = { lower: data.start, upper: data.end }

		cache = updateSizes(cache, data.sizes ?? [], current.lower)
		averageSize =
			cache.length == 0 ? minSize : calculateSum(cache, 0, cache.length, averageSize) / cache.length

		let visible = calculateSum(cache, current.lower, current.upper, averageSize, gap)

		if (maxVisible > 0) {
			visibleCount = maxVisible
		} else {
			while (visible < visibleSize) visible += averageSize
			while (visible - averageSize > visibleSize) visible -= averageSize
			visibleCount = Math.ceil(visible / averageSize)
		}
		current = fixViewportForVisibileCount(current, cache.length, visibleCount)

		// recalculate the lower, upper bounds based on current index
		if (items.length > 0 && data.value && data.value !== value) {
			index = items.findIndex((item) => item === data.value)
			if (index > -1) {
				value = data.value
				current = fitIndexInViewport(index, current, visibleCount)
			}
		}
		updateBounds(current)
	}
	const moveByOffset = (offset) => {
		if (cache.length > 0) {
			index = Math.max(0, Math.min(index + offset, cache.length - 1))
			current = fitIndexInViewport(index, current, visibleCount)
			updateBounds(current)
		}
	}
	const updateBounds = ({ lower, upper }) => {
		const previous = get(bounds)
		if (maxVisible > 0) {
			let visible = calculateSum(cache, lower, upper, averageSize, gap)
			space.update((value) => (value = { ...value, visible }))
		}
		if (previous.lower !== lower) {
			let before = calculateSum(cache, 0, lower, averageSize)
			space.update((value) => (value = { ...value, before }))
		}
		if (previous.upper !== upper) {
			let after = calculateSum(cache, upper, cache.length, averageSize)
			space.update((value) => (value = { ...value, after }))
		}
		if (previous.lower !== lower || previous.upper !== upper) {
			bounds.set({ lower, upper })
		}
	}

	const scrollTo = (position) => {
		const start = Math.round(position / averageSize)
		if (start !== current.lower) update({ start })
	}

	update(options)

	return {
		bounds: pick(['subscribe'], bounds),
		space: pick(['subscribe'], space),
		get index() {
			return index
		},
		update,
		scrollTo,
		moveByOffset,
		next: () => moveByOffset(1),
		previous: () => moveByOffset(-1),
		nextPage: () => moveByOffset(visibleCount),
		previousPage: () => moveByOffset(-visibleCount),
		first: () => moveByOffset(-cache.length),
		last: () => moveByOffset(cache.length + 1)
	}
}

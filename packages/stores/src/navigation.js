import { writable } from 'svelte/store'

export function createNavigator(items, visibleCount = null) {
	let index = -1
	let start = 0
	let end = (visibleCount || items.length) - 1

	const cursor = writable({
		value: null,
		index,
		start,
		end
	})

	const keepSelectedItemVisible = (position) => {
		if (visibleCount === null) return

		if (position < start) {
			start = position
			end = position + visibleCount - 1
		} else if (position > end) {
			end = Math.min(position, items.length - 1)
			start = end - visibleCount + 1
		}
	}

	const updateRange = (lower, upper) => {
		if (lower !== start || upper !== end) {
			start = lower
			end = upper
			cursor.update((state) => ({
				...state,
				start: start,
				end: end
			}))
		}
	}

	const changeStart = (position) => {
		let lower = position
		const upper = Math.min(position + visibleCount - 1, items.length - 1)
		if (lower + visibleCount > upper) lower = upper - visibleCount + 1
		updateRange(lower, upper)
	}

	const changeStartByOffset = (offset) => {
		changeStart(start + offset)
	}

	const changeVisibleCount = (value) => {
		if (value <= items.length) {
			visibleCount = value
			const max = Math.min(start + visibleCount - 1, items.length - 1)
			const min = max - visibleCount + 1
			updateRange(min, max)
		}
	}

	const selectByIndex = (position) => {
		if (position >= 0 && position !== index && position < items.length) {
			index = position
			keepSelectedItemVisible(position)
			cursor.set({
				value: items[index],
				index,
				start,
				end
			})
		}
	}

	const select = (item) => selectByIndex(items.indexOf(item))

	const moveByOffset = (offset) => {
		const position = Math.max(0, Math.min(index + offset, items.length - 1))
		selectByIndex(position)
	}

	return {
		subscribe: cursor.subscribe,
		moveByOffset,
		next: () => moveByOffset(1),
		previous: () => moveByOffset(-1),
		last: () => moveByOffset(items.length),
		first: () => moveByOffset(-items.length),
		select,
		selectByIndex,
		changeStart,
		changeStartByOffset,
		changeVisibleCount
	}
}

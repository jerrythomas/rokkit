import { writable } from 'svelte/store'

export function createNavigator(items, count = null) {
	let index = -1
	let start = 0
	let end = (count || items.length) - 1

	const cursor = writable({
		value: null,
		index,
		start,
		end
	})

	const moveByOffset = (offset) => {
		let position = Math.max(0, Math.min(index + offset, items.length - 1))
		selectByIndex(position)
	}

	const adjustSubset = (position) => {
		if (count === null) return

		if (position < start) {
			start = position
			end = position + count - 1
		} else if (position > end) {
			end = Math.min(position, items.length - 1)
			start = end - count + 1
		}
	}

	const setStart = (position) => {
		start = position
		end = Math.min(start + count - 1, items.length - 1)
		if (start + count > end) start = end - count + 1
		cursor.update((state) => ({ ...state, start, end }))
	}

	const setSubset = (value) => {
		if (value <= items.length) {
			count = value
			end = Math.min(start + count - 1, items.length - 1)
			start = end - count + 1
			cursor.update((state) => ({ ...state, start, end }))
		}
	}
	const select = (item) => selectByIndex(items.indexOf(item))

	const selectByIndex = (position) => {
		if (position >= 0 && position !== index && position < items.length) {
			index = position
			adjustSubset(position)
			cursor.set({ value: items[index], index, start, end })
		}
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
		setStart,
		setSubset
	}
}

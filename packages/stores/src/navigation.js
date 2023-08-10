import { writable } from 'svelte/store'

export function createNavigator(items) {
	let value = null
	let index = -1

	const cursor = writable({
		value,
		index
	})

	const moveByOffset = (offset) => {
		let position = Math.max(0, Math.min(index + offset, items.length - 1))
		selectByIndex(position)
	}

	const select = (item) => {
		selectByIndex(items.indexOf(item))
	}

	const selectByIndex = (position) => {
		if (position >= 0 && position !== index && position < items.length) {
			index = position
			value = items[index]
			cursor.set({ value, index })
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
		selectByIndex
	}
}

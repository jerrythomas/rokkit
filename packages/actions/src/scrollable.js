import { EventManager, emit, getClosestAncestorWithAttribute } from './lib'
import { dimensionAttributes } from './lib/constants'

export function scrollable(element, data) {
	let { items, index, value, start, end, horizontal } = data
	const props = horizontal
		? dimensionAttributes.horizontal
		: dimensionAttributes.vertical

	const listeners = {
		click: (event) => {
			const target = getClosestAncestorWithAttribute(event.target, 'data-path')
			if (target) {
				index = parseInt(target.getAttribute('data-path'), 10)
				value = items[index]
				emit(element, 'select', { index, value })
			}
		},
		scroll: (event) => {
			start = Math.floor(element[props.scroll] / 40)
			emit(element, 'refresh', { start, end })
		},
		keydown: (event) => {
			if (['Enter', ' '].includes(event.key)) {
				emit(element, 'select', { index, value })
			}
		}
	}
	const manager = EventManager(element, listeners)
	const update = (data) => {
		items = data.items
		index = data.index
		value = data.value
		start = data.start ?? 0
		end = data.end ?? 0
		emit(element, 'refresh', { start, end })
	}

	manager.activate()
	update(data)

	return {
		update,
		destroy: () => manager.reset()
	}
}

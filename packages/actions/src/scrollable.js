import { EventManager, emit, getClosestAncestorWithAttribute } from './lib'
import { dimensionAttributes } from './lib/constants'
import { virtualListManager } from './lib'
import { compact } from '@rokkit/core'

export function scrollable(element, data) {
	let index = -1
	let { items, horizontal, maxVisible } = data
	const props = horizontal
		? dimensionAttributes.horizontal
		: dimensionAttributes.vertical
	const vlm = virtualListManager({
		count: items.length,
		availableSize: element[props.offset],
		maxVisible,
		minSize: data.minSize ?? 40
	})
	const keyboardActions = getKeyboardActions(vlm, data.horizontal)

	const contents = element.querySelector('virtual-list-contents')
	const listeners = {
		click: (event) => {
			const target = getClosestAncestorWithAttribute(event.target, 'data-path')
			if (target) {
				index = parseInt(target.getAttribute('data-path'), 10)
				emit(element, 'select', { index, value: items[index] })
			}
		},
		scroll: () => {
			let start = Math.floor(element[props.scroll] / vlm.averageSize)
			vlm.update({ start })
			adjustViewport()
			if (vlm.deltaVisible !== 0) {
				emit(element, 'refresh', { start: vlm.start, end: vlm.end })
			}
		},
		keydown: (event) => {
			if (event.key in keyboardActions) {
				keyboardActions[event.key]()
				if (index !== vlm.index) {
					index = vlm.index
					adjustViewport()
					emit(element, 'move', { index, value: items[index] })
				}
			} else if (['Enter', ' '].includes(event.key) && index !== -1) {
				emit(element, 'select', { index, value: items[index] })
			} else if (event.key === 'Escape') {
				emit(element, 'cancel')
			}
		}
	}
	const manager = EventManager(element, listeners)

	const adjustViewport = () => {
		if (maxVisible) element.style[props.size] = vlm.visibleSize + 'px'
		element.scrollTo(0, vlm.spaceBefore)
		contents.style[props.paddingStart] = vlm.spaceBefore + 'px'
		contents.style[props.paddingEnd] = vlm.spaceAfter + 'px'
	}
	const update = (data) => {
		items = data.items ?? items

		if (data.value) {
			index = items.indexOf(data.value)
		}

		const start = data.start ?? vlm.start
		const end = data.end ?? vlm.end

		const listItems = element.querySelectorAll('virtual-list-item')
		vlm.update({ elements: listItems, count: items.length, start, end, index })
		adjustViewport()
		if (vlm.delta !== 0) {
			emit(element, 'refresh', { start: vlm.start, end: vlm.end })
		}
	}

	manager.activate()
	update(data)

	return {
		update,
		destroy: () => manager.reset()
	}
}

function getKeyboardActions(vlm, horizontal = false) {
	return compact({
		ArrowUp: horizontal ? null : () => vlm.previous(),
		ArrowDown: horizontal ? null : () => vlm.next(),
		ArrowLeft: !horizontal ? null : () => vlm.previous(),
		ArrowRight: !horizontal ? null : () => vlm.next(),
		Home: () => vlm.first(),
		End: () => vlm.last(),
		PageUp: () => vlm.previousPage(),
		PageDown: () => vlm.nextPage()
	})
}

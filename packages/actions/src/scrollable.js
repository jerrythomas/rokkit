import { EventManager, emit, getClosestAncestorWithAttribute } from './lib'
import { dimensionAttributes } from './lib/constants'
import { compact } from '@rokkit/core'
import { ViewportFactory } from './lib/viewport'

export function scrollable(element, data) {
	let index = -1
	let { items, horizontal, maxVisible } = data
	const props = horizontal
		? dimensionAttributes.horizontal
		: dimensionAttributes.vertical
	const vlm = ViewportFactory(
		items.length,
		element[props.offset],
		maxVisible,
		data.minSize ?? 40
	)

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
			// console.log('scroll event', element[props.scroll])
			let start = Math.floor(element[props.scroll] / vlm.averageSize)
			vlm.updateStartEnd(start, vlm.end)
			adjustViewport()
			// console.log(props.paddingStart, props.paddingEnd, vlm.spaceBefore, vlm.spaceAfter)
		},
		keydown: (event) => {
			if (event.key in keyboardActions) {
				keyboardActions[event.key]()
				if (index !== vlm.index) {
					index = vlm.index
					adjustViewport()
					emit(element, 'move', { index, value: items[index] })
				}
			} else if (['Enter', ' '].includes(event.key) && vlm.index !== -1) {
				emit(element, 'select', { index: vlm.index, value: items[vlm.index] })
			} else if (event.key === 'Escape') {
				emit(element, 'cancel')
			}
		}
	}
	const manager = EventManager(element, listeners)

	const adjustViewport = () => {
		if (maxVisible) element.style[props.size] = vlm.visibleSize + 'px'

		contents.style[props.paddingStart] = vlm.spaceBefore + 'px'
		contents.style[props.paddingEnd] = vlm.spaceAfter + 'px'
		element.scrollTo(0, vlm.spaceBefore)

		if (vlm.viewChanged)
			emit(element, 'refresh', { start: vlm.start, end: vlm.end })
	}

	const update = (data) => {
		const listItems = element.querySelectorAll('virtual-list-item')
		items = data.items ?? items
		vlm.count = items.length
		vlm.updateStartEnd(data.start, data.end)
		if (data.value) vlm.index = items.indexOf(data.value)
		vlm.updateSizes(listItems, props.offset)

		adjustViewport()
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

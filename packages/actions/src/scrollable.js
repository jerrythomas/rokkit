import { EventManager, emit, getClosestAncestorWithAttribute } from './lib'
import { dimensionAttributes } from './lib/constants'
import { virtualListManager } from './lib'

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
			if (maxVisible) element.style[props.size] = vlm.visibleSize + 'px'
			element.scrollTo(0, vlm.spaceBefore)
			contents.style[props.paddingStart] = vlm.spaceBefore + 'px'
			contents.style[props.paddingEnd] = vlm.spaceAfter + 'px'
			if (vlm.deltaVisible !== 0) {
				emit(element, 'refresh', { start: vlm.start, end: vlm.end })
			}
		},
		keydown: (event) => {
			if (['Enter', ' '].includes(event.key) && index !== -1) {
				emit(element, 'select', { index, value: items[index] })
			}
		}
	}
	const manager = EventManager(element, listeners)
	const update = (data) => {
		items = data.items ?? items

		if (data.value) {
			index = items.indexOf(data.value)
		}

		const start = data.start ?? vlm.start
		const end = data.end ?? vlm.end

		const listItems = element.querySelectorAll('virtual-list-item')
		vlm.update({ elements: listItems, count: items.length, start, end, index })

		if (maxVisible) element.style[props.size] = vlm.visibleSize + 'px'
		element.scrollTo(0, vlm.spaceBefore)
		contents.style[props.paddingStart] = vlm.spaceBefore + 'px'
		contents.style[props.paddingEnd] = vlm.spaceAfter + 'px'

		// console.log('vlm.delta', vlm.delta)
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

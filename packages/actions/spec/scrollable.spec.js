import { beforeEach, describe, expect, it, vi, afterEach } from 'vitest'
import { mockVirtualList } from './mocks/virtual-list'
import { scrollable } from '../src/scrollable'
import { toUseHandlersFor, toHaveBeenDispatchedWith } from 'validators'

expect.extend({ toUseHandlersFor, toHaveBeenDispatchedWith })

describe('scrollable', () => {
	const items = Array.from({ length: 10 }, (_, i) => ({ text: i }))
	const events = ['refresh', 'move', 'select', 'cancel']
	let mock
	let handlers = {}

	beforeEach(() => {
		mock = mockVirtualList()

		events.map((event) => {
			handlers[event] = vi.fn()
			mock.viewport.addEventListener(event, handlers[event])
		})
	})

	afterEach(() => {
		// while (content.lastChild) content.removeChild(content.lastChild)
		vi.resetAllMocks()
	})

	it('should set up and clean up events', () => {
		expect(scrollable).toUseHandlersFor({ items }, [
			'scroll',
			'keydown',
			'click'
		])
	})

	describe('vertical', () => {
		it('should emit refresh event on init', () => {
			const action = scrollable(mock.viewport, { items })
			expect(handlers.move).not.toHaveBeenCalled()
			expect(handlers.select).not.toHaveBeenCalled()
			expect(handlers.cancel).not.toHaveBeenCalled()
			expect(handlers.refresh).toHaveBeenDispatchedWith({ start: 0, end: 0 })
			action.destroy()
		})
		it('should emit select event on click', () => {
			const action = scrollable(mock.viewport, { items })
			mock.viewport.children[0].children[1].click()
			expect(handlers.select).toHaveBeenDispatchedWith({
				index: 1,
				value: { text: 1 }
			})
			action.destroy()
		})
		it('should emit select event on enter', () => {
			const action = scrollable(mock.viewport, { items })
			mock.viewport.dispatchEvent(
				new KeyboardEvent('keydown', { key: 'Enter' })
			)
			expect(handlers.select).toHaveBeenDispatchedWith({})
			action.destroy()
		})
		it('should emit refresh event on scroll', () => {
			const action = scrollable(mock.viewport, { items })
			mock.viewport.scrollTop = 100
			mock.viewport.dispatchEvent(new Event('scroll'))
			expect(handlers.refresh).toHaveBeenDispatchedWith({ start: 2, end: 0 })
			action.destroy()
		})
	})
	describe('horizontal', () => {
		it('should emit refresh event on init', () => {
			const action = scrollable(mock.viewport, { items, horizontal: true })
			expect(handlers.move).not.toHaveBeenCalled()
			expect(handlers.select).not.toHaveBeenCalled()
			expect(handlers.cancel).not.toHaveBeenCalled()
			expect(handlers.refresh).toHaveBeenDispatchedWith({ start: 0, end: 0 })
			action.destroy()
		})
	})
})

// function addItems(content, count, start, horizontal) {
// 	for (let i = 0; i < count; i++) {
// 		const row = document.createElement('virtual-list-row')
// 		row.textContent = i + start
// 		row.setAttribute('data-index', i + start)
// 		if (horizontal)
// 			Object.defineProperty(row, 'offsetWidth', {
// 				value: 30,
// 				configurable: true
// 			})
// 		else
// 			Object.defineProperty(row, 'offsetHeight', {
// 				value: 30,
// 				configurable: true
// 			})
// 		content.appendChild(row)
// 	}
// 	return content
// }

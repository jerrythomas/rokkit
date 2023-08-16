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
		mock = mockVirtualList({ numberOfItems: 5, start: 0 })

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
			expect(handlers.refresh).toHaveBeenDispatchedWith({ start: 0, end: 10 })
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
			const action = scrollable(mock.viewport, { items, value: items[0] })
			mock.viewport.dispatchEvent(
				new KeyboardEvent('keydown', { key: 'Enter' })
			)
			expect(handlers.select).toHaveBeenDispatchedWith({
				index: 0,
				value: { text: 0 }
			})
			action.destroy()
		})

		it('should update scroll position and emit refresh event on scroll', () => {
			const action = scrollable(mock.viewport, { items })
			expect(mock.viewport.offsetHeight).toBe(500)
			mock.viewport.scrollTop = 100
			mock.viewport.dispatchEvent(new Event('scroll'))
			expect(handlers.refresh).toHaveBeenDispatchedWith({ start: 2, end: 12 })
			expect(mock.viewport.scrollTop).toBe(80)
			expect(mock.viewport.scrollTo).toHaveBeenCalledWith(0, 80)
			expect(mock.contents.style.paddingTop).toBe('80px')
			expect(mock.contents.style.paddingBottom).toBe('0px')
			expect(mock.viewport.offsetHeight).toBe(500)
			action.destroy()
		})

		it('should resize and emit refresh event on scroll', () => {
			const action = scrollable(mock.viewport, { items, maxVisible: 5 })
			expect(mock.viewport.offsetHeight).toBe(200)
			mock.viewport.scrollTop = 100
			mock.viewport.dispatchEvent(new Event('scroll'))
			expect(handlers.refresh).toHaveBeenDispatchedWith({ start: 2, end: 7 })
			expect(mock.viewport.scrollTop).toBe(80)
			expect(mock.viewport.scrollTo).toHaveBeenCalledWith(0, 80)
			expect(mock.contents.style.paddingTop).toBe('80px')
			expect(mock.contents.style.paddingBottom).toBe('120px')
			expect(mock.viewport.offsetHeight).toBe(200)
			action.destroy()
		})

		it('should emit update index on value change', () => {
			const action = scrollable(mock.viewport, { items, maxVisible: 5 })
			expect(handlers.refresh).toHaveBeenDispatchedWith({ start: 0, end: 5 })

			action.update({ items, value: items[8] })
			expect(handlers.refresh).toHaveBeenDispatchedWith({ start: 4, end: 9 })
			expect(mock.viewport.scrollTop).toBe(160)
			expect(mock.contents.style.paddingTop).toBe('160px')
			expect(mock.contents.style.paddingBottom).toBe('40px')
			expect(mock.viewport.offsetHeight).toBe(200)
			action.destroy()
		})
	})
	describe('horizontal', () => {
		it('should emit refresh event on init', () => {
			const action = scrollable(mock.viewport, { items, horizontal: true })
			expect(handlers.move).not.toHaveBeenCalled()
			expect(handlers.select).not.toHaveBeenCalled()
			expect(handlers.cancel).not.toHaveBeenCalled()
			expect(handlers.refresh).toHaveBeenDispatchedWith({ start: 0, end: 10 })
			action.destroy()
		})
	})
})

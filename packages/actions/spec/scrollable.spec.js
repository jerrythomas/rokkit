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
		events.map((event) => {
			mock.viewport.removeEventListener(event, handlers[event])
		})
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
			expect(handlers.refresh).toHaveBeenDispatchedWith({ start: 0, end: 5 })
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

			expect(mock.viewport.offsetHeight).toBe(200)
			mock.viewport.scrollTop = 100
			mock.viewport.dispatchEvent(new Event('scroll'))
			expect(handlers.refresh).toHaveBeenDispatchedWith({ start: 2, end: 7 })
			expect(mock.viewport.scrollTo).toHaveBeenCalledWith(0, 80)
			expect(mock.viewport.scrollTop).toBe(80)
			expect(mock.contents.style.paddingTop).toBe('80px')
			expect(mock.contents.style.paddingBottom).toBe('120px')
			expect(mock.viewport.offsetHeight).toBe(200)
			action.destroy()
		})

		it('should resize and emit refresh event on scroll', () => {
			const action = scrollable(mock.viewport, { items, maxVisible: 4 })
			expect(mock.viewport.offsetHeight).toBe(160)
			mock.viewport.scrollTop = 100
			mock.viewport.dispatchEvent(new Event('scroll'))
			expect(handlers.refresh).toHaveBeenDispatchedWith({ start: 2, end: 6 })
			expect(mock.viewport.scrollTop).toBe(80)
			expect(mock.viewport.scrollTo).toHaveBeenCalledWith(0, 80)
			expect(mock.contents.style.paddingTop).toBe('80px')
			expect(mock.contents.style.paddingBottom).toBe('160px')
			expect(mock.viewport.offsetHeight).toBe(160)
			action.destroy()
		})

		it('should emit refresh on value change', () => {
			const action = scrollable(mock.viewport, { items, maxVisible: 5 })
			// expect(handlers.refresh).toHaveBeenCalledTimes(1)
			// expect(handlers.refresh).toHaveBeenDispatchedWith({ start: 0, end: 5 })

			action.update({ items, value: items[8], start: 0, end: 5 })
			expect(handlers.refresh).toHaveBeenDispatchedWith({ start: 4, end: 9 })
			expect(mock.viewport.scrollTop).toBe(160)
			expect(mock.contents.style.paddingTop).toBe('160px')
			expect(mock.contents.style.paddingBottom).toBe('40px')
			expect(mock.viewport.offsetHeight).toBe(200)
			action.destroy()
		})

		it('should emit move event on arrow down', () => {
			const action = scrollable(mock.viewport, { items, maxVisible: 5 })
			mock.viewport.dispatchEvent(
				new KeyboardEvent('keydown', { key: 'ArrowDown' })
			)
			expect(handlers.move).toHaveBeenDispatchedWith({
				index: 0,
				value: { text: 0 }
			})
			action.destroy()
		})

		it('should emit move event on arrow up', () => {
			const action = scrollable(mock.viewport, { items, maxVisible: 5 })

			action.update({ value: items[5] })
			action.update({ value: items[5], start: 1, end: 6 })
			mock.viewport.dispatchEvent(
				new KeyboardEvent('keydown', { key: 'ArrowUp' })
			)
			expect(handlers.move).toHaveBeenDispatchedWith({
				index: 4,
				value: { text: 4 }
			})
			expect(handlers.refresh).toHaveBeenCalledTimes(1)
			action.destroy()
		})

		it('should emit move event on page down', () => {
			const action = scrollable(mock.viewport, { items, maxVisible: 5 })
			mock.viewport.dispatchEvent(
				new KeyboardEvent('keydown', { key: 'PageDown' })
			)
			expect(handlers.move).toHaveBeenDispatchedWith({
				index: 4,
				value: { text: 4 }
			})
			// expect(handlers.refresh).toHaveBeenDispatchedWith({
			// 	start: 0,
			// 	end: 5
			// })
			action.destroy()
		})
		it('should emit move event on page up', () => {
			const action = scrollable(mock.viewport, { items, maxVisible: 5 })
			action.update({ value: items[9] })
			mock.viewport.dispatchEvent(
				new KeyboardEvent('keydown', { key: 'PageUp' })
			)
			expect(handlers.refresh).toHaveBeenDispatchedWith({
				start: 4,
				end: 9
			})
			expect(handlers.move).toHaveBeenDispatchedWith({
				index: 4,
				value: { text: 4 }
			})
			action.destroy()
		})
		it('should emit move event on home', () => {
			const action = scrollable(mock.viewport, { items, maxVisible: 5 })
			mock.viewport.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home' }))
			expect(handlers.move).toHaveBeenDispatchedWith({
				index: 0,
				value: { text: 0 }
			})
			// expect(handlers.refresh).toHaveBeenDispatchedWith({
			// 	start: 0,
			// 	end: 5
			// })
			action.destroy()
		})
		it('should emit move event on end', () => {
			const action = scrollable(mock.viewport, { items, maxVisible: 5 })
			mock.viewport.dispatchEvent(new KeyboardEvent('keydown', { key: 'End' }))
			expect(handlers.move).toHaveBeenDispatchedWith({
				index: 9,
				value: { text: 9 }
			})
			// expect(handlers.refresh).toHaveBeenDispatchedWith({
			// 	start: 5,
			// 	end: 10
			// })
			action.destroy()
		})
		it('should emit cancel event on escape', () => {
			const action = scrollable(mock.viewport, { items, maxVisible: 5 })
			mock.viewport.dispatchEvent(
				new KeyboardEvent('keydown', { key: 'Escape' })
			)
			expect(handlers.cancel).toHaveBeenDispatchedWith(null)
			action.destroy()
		})
		it('should not emit events on arrow left', () => {
			const action = scrollable(mock.viewport, { items, maxVisible: 5 })
			mock.viewport.dispatchEvent(
				new KeyboardEvent('keydown', { key: 'ArrowLeft' })
			)
			expect(handlers.move).not.toHaveBeenCalled()
			expect(handlers.select).not.toHaveBeenCalled()
			expect(handlers.cancel).not.toHaveBeenCalled()
			// expect(handlers.refresh).not.toHaveBeenCalledOnce()
			action.destroy()
		})
	})
	describe('horizontal', () => {
		it('should emit refresh event on init', () => {
			const action = scrollable(mock.viewport, { items, horizontal: true })
			expect(handlers.move).not.toHaveBeenCalled()
			expect(handlers.select).not.toHaveBeenCalled()
			expect(handlers.cancel).not.toHaveBeenCalled()
			expect(handlers.refresh).toHaveBeenDispatchedWith({ start: 0, end: 3 })
			action.destroy()
		})

		it('should emit refresh when value is changed', () => {
			const action = scrollable(mock.viewport, {
				items,
				maxVisible: 5,
				horizontal: true
			})
			// expect(handlers.refresh).toHaveBeenDispatchedWith({ start: 0, end: 5 })
			action.update({ start: 0, end: 5, value: items[8] })
			expect(handlers.refresh).toHaveBeenDispatchedWith({ start: 4, end: 9 })
		})
		it('should emit move event on arrow left', () => {
			const action = scrollable(mock.viewport, {
				items,
				maxVisible: 5,
				horizontal: true
			})
			action.update({ value: items[5] })
			mock.viewport.dispatchEvent(
				new KeyboardEvent('keydown', { key: 'ArrowLeft' })
			)
			expect(handlers.move).toHaveBeenDispatchedWith({
				index: 4,
				value: { text: 4 }
			})
			expect(handlers.refresh).toHaveBeenCalledTimes(2)

			action.destroy()
		})

		it('should emit move event on arrow right', () => {
			const action = scrollable(mock.viewport, {
				items,
				maxVisible: 5,
				horizontal: true
			})
			action.update({ value: items[5] })
			mock.viewport.dispatchEvent(
				new KeyboardEvent('keydown', { key: 'ArrowRight' })
			)
			expect(handlers.move).toHaveBeenDispatchedWith({
				index: 6,
				value: { text: 6 }
			})
			expect(handlers.refresh).toHaveBeenDispatchedWith({
				start: 2,
				end: 7
			})
			action.destroy()
		})
	})
})

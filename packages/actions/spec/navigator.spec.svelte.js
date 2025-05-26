import { vi, it, expect, describe, beforeEach, afterEach } from 'vitest'
import { flushSync } from 'svelte'
import { navigator } from '../src/navigator.svelte.js'
import { toHaveBeenDispatchedWith } from '@rokkit/helpers/matchers'
import { fireEvent } from '@testing-library/svelte'

expect.extend({ toHaveBeenDispatchedWith })

describe('navigator', () => {
	const root = document.createElement('div')
	const action = vi.fn()
	const wrapper = {
		moveFirst: vi.fn(),
		moveLast: vi.fn(),
		moveTo: vi.fn(),
		moveNext: vi.fn(),
		movePrev: vi.fn(),
		select: vi.fn(),
		expand: vi.fn(),
		collapse: vi.fn(),
		toggleExpansion: vi.fn(),
		extendSelection: vi.fn(),
		focused: { text: 'active' },
		selected: [{ text: 'selected' }]
	}

	const getEventsFromDetail = () => {
		return action.mock.calls.map((call) => call[0].detail.name)
	}
	// Setup test DOM structure
	beforeEach(() => {
		root.addEventListener('action', action)
		root.innerHTML = `
      <div data-path="0">Item 1
        <rk-icon data-tag-icon data-state="closed"></rk-icon>
        <div data-path="0-0">Child 1</div>
        <div data-path="0-1">Child 2</div>
      </div>
      <div data-path="1">Item 2
        <rk-icon data-tag-icon data-state="opened"></rk-icon>
      </div>
    `
	})

	afterEach(() => {
		vi.clearAllMocks()
	})
	describe('keyboard', () => {
		describe('vertical', () => {
			it('should handle vertical navigation keys', () => {
				const cleanup = $effect.root(() => navigator(root, { wrapper, orientation: 'vertical' }))
				flushSync()

				root.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowDown' }))
				expect(wrapper.moveNext).toHaveBeenCalled()
				expect(action).not.toHaveBeenCalled()

				wrapper.moveNext.mockReturnValue(true)
				root.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowDown' }))
				expect(action).toHaveBeenCalledTimes(1)

				root.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowUp' }))
				expect(wrapper.movePrev).toHaveBeenCalled()

				wrapper.movePrev.mockReturnValue(true)
				root.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowUp' }))
				expect(wrapper.movePrev).toHaveBeenCalled()
				expect(action).toHaveBeenCalledTimes(2)

				root.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter' }))
				expect(wrapper.select).toHaveBeenCalled()

				wrapper.select.mockReturnValue(true)
				root.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter' }))
				expect(action).toHaveBeenCalledTimes(3)

				root.dispatchEvent(new KeyboardEvent('keyup', { key: ' ', ctrlKey: true }))
				expect(wrapper.extendSelection).toHaveBeenCalledTimes(1)
				expect(action).toHaveBeenCalledTimes(3)

				wrapper.extendSelection.mockReturnValue(true)
				root.dispatchEvent(new KeyboardEvent('keyup', { key: ' ', metaKey: true }))
				expect(wrapper.extendSelection).toHaveBeenCalledTimes(2)
				expect(action).toHaveBeenCalledTimes(4)

				root.dispatchEvent(new KeyboardEvent('keyup', { key: 'Home' }))
				expect(wrapper.moveFirst).toHaveBeenCalledTimes(1)
				root.dispatchEvent(new KeyboardEvent('keyup', { key: 'Home', ctrlKey: true }))
				expect(wrapper.moveFirst).toHaveBeenCalledTimes(2)
				root.dispatchEvent(new KeyboardEvent('keyup', { key: 'Home', metaKey: true }))
				expect(wrapper.moveFirst).toHaveBeenCalledTimes(3)
				root.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowUp', metaKey: true }))
				expect(wrapper.moveFirst).toHaveBeenCalledTimes(4)
				wrapper.moveFirst.mockReturnValue(true)
				root.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowUp', ctrlKey: true }))
				expect(wrapper.moveFirst).toHaveBeenCalledTimes(5)
				expect(action).toHaveBeenCalledTimes(5)
				expect(getEventsFromDetail()).toEqual(['move', 'move', 'select', 'select', 'move'])

				root.dispatchEvent(new KeyboardEvent('keyup', { key: 'End' }))
				expect(wrapper.moveLast).toHaveBeenCalledTimes(1)
				root.dispatchEvent(new KeyboardEvent('keyup', { key: 'End', ctrlKey: true }))
				expect(wrapper.moveLast).toHaveBeenCalledTimes(2)
				root.dispatchEvent(new KeyboardEvent('keyup', { key: 'End', metaKey: true }))
				expect(wrapper.moveLast).toHaveBeenCalledTimes(3)
				root.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowDown', ctrlKey: true }))
				expect(wrapper.moveLast).toHaveBeenCalledTimes(4)
				wrapper.moveLast.mockReturnValue(true)
				root.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowDown', metaKey: true }))
				expect(wrapper.moveLast).toHaveBeenCalledTimes(5)

				expect(action).toHaveBeenCalledTimes(6)
				expect(getEventsFromDetail()).toEqual(['move', 'move', 'select', 'select', 'move', 'move'])
				cleanup()
			})

			it('should include expand/collapse when nested in LTR mode', () => {
				const cleanup = $effect.root(() =>
					navigator(root, { wrapper, orientation: 'vertical', dir: 'ltr', nested: true })
				)
				flushSync()
				root.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowRight' }))
				expect(wrapper.expand).toHaveBeenCalled()

				root.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowLeft' }))
				expect(wrapper.collapse).toHaveBeenCalled()
				cleanup()
			})
		})

		describe('vertical RTL', () => {
			it('should handle vertical navigation keys in RTL mode', () => {
				const cleanup = $effect.root(() =>
					navigator(root, { wrapper, orientation: 'vertical', dir: 'rtl' })
				)
				flushSync()

				// Basic navigation remains the same in RTL (up/down)
				root.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowDown' }))
				expect(wrapper.moveNext).toHaveBeenCalled()

				root.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowUp' }))
				expect(wrapper.movePrev).toHaveBeenCalled()

				// Selection also remains the same
				root.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter' }))
				expect(wrapper.select).toHaveBeenCalled()

				cleanup()
			})

			it('should flip expand/collapse arrow keys in RTL nested mode', () => {
				const cleanup = $effect.root(() =>
					navigator(root, { wrapper, orientation: 'vertical', dir: 'rtl', nested: true })
				)
				flushSync()

				// In RTL, the meaning of left/right is reversed for tree operations
				root.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowLeft' }))
				expect(wrapper.expand).toHaveBeenCalled()

				root.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowRight' }))
				expect(wrapper.collapse).toHaveBeenCalled()

				cleanup()
			})
		})

		describe('horizontal', () => {
			it('should handle horizontal navigation keys', () => {
				const cleanup = $effect.root(() => navigator(root, { wrapper, orientation: 'horizontal' }))
				flushSync()

				root.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowRight' }))
				expect(wrapper.moveNext).toHaveBeenCalled()

				root.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowLeft' }))
				expect(wrapper.movePrev).toHaveBeenCalled()

				root.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter' }))
				expect(wrapper.select).toHaveBeenCalled()

				root.dispatchEvent(new KeyboardEvent('keyup', { key: ' ', ctrlKey: true }))
				expect(wrapper.extendSelection).toHaveBeenCalledTimes(1)
				root.dispatchEvent(new KeyboardEvent('keyup', { key: ' ', metaKey: true }))
				expect(wrapper.extendSelection).toHaveBeenCalledTimes(2)

				root.dispatchEvent(new KeyboardEvent('keyup', { key: 'Home' }))
				expect(wrapper.moveFirst).toHaveBeenCalledTimes(1)
				root.dispatchEvent(new KeyboardEvent('keyup', { key: 'Home', ctrlKey: true }))
				expect(wrapper.moveFirst).toHaveBeenCalledTimes(2)
				root.dispatchEvent(new KeyboardEvent('keyup', { key: 'Home', metaKey: true }))
				expect(wrapper.moveFirst).toHaveBeenCalledTimes(3)
				root.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowLeft', metaKey: true }))
				expect(wrapper.moveFirst).toHaveBeenCalledTimes(4)
				root.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowLeft', ctrlKey: true }))
				expect(wrapper.moveFirst).toHaveBeenCalledTimes(5)

				root.dispatchEvent(new KeyboardEvent('keyup', { key: 'End' }))
				expect(wrapper.moveLast).toHaveBeenCalledTimes(1)
				root.dispatchEvent(new KeyboardEvent('keyup', { key: 'End', ctrlKey: true }))
				expect(wrapper.moveLast).toHaveBeenCalledTimes(2)
				root.dispatchEvent(new KeyboardEvent('keyup', { key: 'End', metaKey: true }))
				expect(wrapper.moveLast).toHaveBeenCalledTimes(3)
				root.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowRight', ctrlKey: true }))
				expect(wrapper.moveLast).toHaveBeenCalledTimes(4)
				root.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowRight', metaKey: true }))
				expect(wrapper.moveLast).toHaveBeenCalledTimes(5)

				root.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowDown' }))
				expect(wrapper.expand).not.toHaveBeenCalled()

				root.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowUp' }))
				expect(wrapper.collapse).not.toHaveBeenCalled()

				cleanup()
			})
			it('should include expand/collapse when nested', () => {
				const cleanup = $effect.root(() =>
					navigator(root, { wrapper, orientation: 'horizontal', nested: true })
				)
				flushSync()
				root.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowDown' }))
				expect(wrapper.expand).toHaveBeenCalled()

				root.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowUp' }))
				expect(wrapper.collapse).toHaveBeenCalled()
				cleanup()
			})
		})

		describe('horizontal RTL', () => {
			it('should reverse left/right navigation keys in horizontal RTL mode', () => {
				const cleanup = $effect.root(() =>
					navigator(root, { wrapper, orientation: 'horizontal', dir: 'rtl' })
				)
				flushSync()

				// In RTL horizontal mode, left/right arrow keys are reversed
				root.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowRight' }))
				expect(wrapper.movePrev).toHaveBeenCalled()

				root.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowLeft' }))
				expect(wrapper.moveNext).toHaveBeenCalled()

				// Selection remains the same
				root.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter' }))
				expect(wrapper.select).toHaveBeenCalled()

				cleanup()
			})

			it('should retain expand/collapse keys in horizontal RTL nested mode', () => {
				const cleanup = $effect.root(() =>
					navigator(root, { wrapper, orientation: 'horizontal', dir: 'rtl', nested: true })
				)
				flushSync()

				// In horizontal mode, up/down for expand/collapse is not affected by RTL
				root.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowDown' }))
				expect(wrapper.expand).toHaveBeenCalled()

				root.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowUp' }))
				expect(wrapper.collapse).toHaveBeenCalled()

				cleanup()
			})
		})
	})
	describe('click handling', () => {
		it('should handle item click', () => {
			const cleanup = $effect.root(() => navigator(root, { wrapper }))
			flushSync()

			const item = root.querySelector('[data-path="0"]')

			wrapper.select.mockReturnValue(false)
			item.click()
			expect(wrapper.select).toHaveBeenCalledWith('0')
			expect(action).not.toHaveBeenCalled()

			wrapper.select.mockReturnValue(true)
			item.click()
			expect(wrapper.select).toHaveBeenCalledWith('0')
			expect(wrapper.select).toHaveBeenCalledTimes(2)
			expect(action).toHaveBeenCalledTimes(2)
			expect(action).toHaveBeenDispatchedWith({
				name: 'select',
				data: {
					value: wrapper.focused,
					selected: wrapper.selected
				}
			})
			expect(getEventsFromDetail()).toEqual(['move', 'select'])

			cleanup()
		})

		it('should handle icon click for expansion', () => {
			const cleanup = $effect.root(() =>
				navigator(root, {
					wrapper,
					orientation: 'vertical'
				})
			)
			flushSync()

			const icon = root.querySelector('[data-state="closed"]')
			wrapper.toggleExpansion.mockReturnValue(true)
			icon.click()
			expect(wrapper.toggleExpansion).toHaveBeenCalledWith('0')
			expect(wrapper.moveTo).not.toHaveBeenCalled()
			expect(wrapper.select).not.toHaveBeenCalled()

			cleanup()
		})

		it('should handle icon click for collapse', () => {
			const cleanup = $effect.root(() =>
				navigator(root, {
					wrapper,
					orientation: 'vertical'
				})
			)
			flushSync()

			const icon = root.querySelector('[data-state="opened"]')
			wrapper.toggleExpansion.mockReturnValue(true)
			icon.click()
			expect(wrapper.toggleExpansion).toHaveBeenCalledWith('1')
			expect(wrapper.select).not.toHaveBeenCalled()
			expect(wrapper.moveTo).not.toHaveBeenCalled()
			expect(wrapper.collapse).not.toHaveBeenCalled()

			cleanup()
		})

		it('should handle modifier keys during selection', () => {
			const cleanup = $effect.root(() =>
				navigator(root, {
					wrapper,
					orientation: 'vertical'
				})
			)
			flushSync()

			const item = root.querySelector('[data-path="0"]')
			fireEvent.click(item, { ctrlKey: true })

			expect(wrapper.select).not.toHaveBeenCalled()
			expect(wrapper.extendSelection).toHaveBeenCalledWith('0')

			cleanup()
		})
	})

	it('should cleanup event listeners', () => {
		const addEventListenerSpy = vi.spyOn(root, 'addEventListener')
		const removeEventListenerSpy = vi.spyOn(root, 'removeEventListener')

		const cleanup = $effect.root(() =>
			navigator(root, {
				wrapper,
				orientation: 'vertical'
			})
		)
		flushSync()

		expect(addEventListenerSpy).toHaveBeenCalledTimes(2)
		expect(addEventListenerSpy).toHaveBeenNthCalledWith(1, 'keyup', expect.any(Function), {})
		expect(addEventListenerSpy).toHaveBeenNthCalledWith(2, 'click', expect.any(Function), {})

		cleanup()
		expect(removeEventListenerSpy).toHaveBeenCalledTimes(2)
		expect(removeEventListenerSpy).toHaveBeenNthCalledWith(1, 'keyup', expect.any(Function), {})
		expect(removeEventListenerSpy).toHaveBeenNthCalledWith(2, 'click', expect.any(Function), {})

		addEventListenerSpy.mockRestore()
		removeEventListenerSpy.mockRestore()
	})
})

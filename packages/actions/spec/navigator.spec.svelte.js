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
        <span data-tag-icon data-state="closed"></span>
        <div data-path="0-0">Child 1</div>
        <div data-path="0-1">Child 2</div>
      </div>
      <div data-path="1">Item 2
        <span data-tag-icon data-state="opened"></span>
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

				root.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }))
				expect(wrapper.moveNext).toHaveBeenCalled()
				expect(action).not.toHaveBeenCalled()

				wrapper.moveNext.mockReturnValue(true)
				root.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }))
				expect(action).toHaveBeenCalledTimes(1)

				root.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }))
				expect(wrapper.movePrev).toHaveBeenCalled()

				wrapper.movePrev.mockReturnValue(true)
				root.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }))
				expect(wrapper.movePrev).toHaveBeenCalled()
				expect(action).toHaveBeenCalledTimes(2)

				root.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))
				expect(wrapper.select).toHaveBeenCalled()

				wrapper.select.mockReturnValue(true)
				root.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))
				expect(action).toHaveBeenCalledTimes(3)

				root.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', ctrlKey: true }))
				expect(wrapper.extendSelection).toHaveBeenCalledTimes(1)
				expect(action).toHaveBeenCalledTimes(3)

				wrapper.extendSelection.mockReturnValue(true)
				root.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', metaKey: true }))
				expect(wrapper.extendSelection).toHaveBeenCalledTimes(2)
				expect(action).toHaveBeenCalledTimes(4)

				root.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home' }))
				expect(wrapper.moveFirst).toHaveBeenCalledTimes(1)
				root.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', ctrlKey: true }))
				expect(wrapper.moveFirst).toHaveBeenCalledTimes(2)
				root.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', metaKey: true }))
				expect(wrapper.moveFirst).toHaveBeenCalledTimes(3)
				root.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', metaKey: true }))
				expect(wrapper.moveFirst).toHaveBeenCalledTimes(4)
				wrapper.moveFirst.mockReturnValue(true)
				root.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', ctrlKey: true }))
				expect(wrapper.moveFirst).toHaveBeenCalledTimes(5)
				expect(action).toHaveBeenCalledTimes(5)
				expect(getEventsFromDetail()).toEqual(['move', 'move', 'select', 'select', 'move'])

				root.dispatchEvent(new KeyboardEvent('keydown', { key: 'End' }))
				expect(wrapper.moveLast).toHaveBeenCalledTimes(1)
				root.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', ctrlKey: true }))
				expect(wrapper.moveLast).toHaveBeenCalledTimes(2)
				root.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', metaKey: true }))
				expect(wrapper.moveLast).toHaveBeenCalledTimes(3)
				root.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', ctrlKey: true }))
				expect(wrapper.moveLast).toHaveBeenCalledTimes(4)
				wrapper.moveLast.mockReturnValue(true)
				root.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', metaKey: true }))
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
				root.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }))
				expect(wrapper.expand).toHaveBeenCalled()

				root.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }))
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
				root.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }))
				expect(wrapper.moveNext).toHaveBeenCalled()

				root.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }))
				expect(wrapper.movePrev).toHaveBeenCalled()

				// Selection also remains the same
				root.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))
				expect(wrapper.select).toHaveBeenCalled()

				cleanup()
			})

			it('should flip expand/collapse arrow keys in RTL nested mode', () => {
				const cleanup = $effect.root(() =>
					navigator(root, { wrapper, orientation: 'vertical', dir: 'rtl', nested: true })
				)
				flushSync()

				// In RTL, the meaning of left/right is reversed for tree operations
				root.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }))
				expect(wrapper.expand).toHaveBeenCalled()

				root.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }))
				expect(wrapper.collapse).toHaveBeenCalled()

				cleanup()
			})
		})

		describe('horizontal', () => {
			it('should handle horizontal navigation keys', () => {
				const cleanup = $effect.root(() => navigator(root, { wrapper, orientation: 'horizontal' }))
				flushSync()

				root.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }))
				expect(wrapper.moveNext).toHaveBeenCalled()

				root.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }))
				expect(wrapper.movePrev).toHaveBeenCalled()

				root.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))
				expect(wrapper.select).toHaveBeenCalled()

				root.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', ctrlKey: true }))
				expect(wrapper.extendSelection).toHaveBeenCalledTimes(1)
				root.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', metaKey: true }))
				expect(wrapper.extendSelection).toHaveBeenCalledTimes(2)

				root.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home' }))
				expect(wrapper.moveFirst).toHaveBeenCalledTimes(1)
				root.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', ctrlKey: true }))
				expect(wrapper.moveFirst).toHaveBeenCalledTimes(2)
				root.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', metaKey: true }))
				expect(wrapper.moveFirst).toHaveBeenCalledTimes(3)
				root.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', metaKey: true }))
				expect(wrapper.moveFirst).toHaveBeenCalledTimes(4)
				root.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', ctrlKey: true }))
				expect(wrapper.moveFirst).toHaveBeenCalledTimes(5)

				root.dispatchEvent(new KeyboardEvent('keydown', { key: 'End' }))
				expect(wrapper.moveLast).toHaveBeenCalledTimes(1)
				root.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', ctrlKey: true }))
				expect(wrapper.moveLast).toHaveBeenCalledTimes(2)
				root.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', metaKey: true }))
				expect(wrapper.moveLast).toHaveBeenCalledTimes(3)
				root.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', ctrlKey: true }))
				expect(wrapper.moveLast).toHaveBeenCalledTimes(4)
				root.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', metaKey: true }))
				expect(wrapper.moveLast).toHaveBeenCalledTimes(5)

				root.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }))
				expect(wrapper.expand).not.toHaveBeenCalled()

				root.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }))
				expect(wrapper.collapse).not.toHaveBeenCalled()

				cleanup()
			})
			it('should include expand/collapse when nested', () => {
				const cleanup = $effect.root(() =>
					navigator(root, { wrapper, orientation: 'horizontal', nested: true })
				)
				flushSync()
				root.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }))
				expect(wrapper.expand).toHaveBeenCalled()

				root.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }))
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
				root.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }))
				expect(wrapper.movePrev).toHaveBeenCalled()

				root.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }))
				expect(wrapper.moveNext).toHaveBeenCalled()

				// Selection remains the same
				root.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))
				expect(wrapper.select).toHaveBeenCalled()

				cleanup()
			})

			it('should retain expand/collapse keys in horizontal RTL nested mode', () => {
				const cleanup = $effect.root(() =>
					navigator(root, { wrapper, orientation: 'horizontal', dir: 'rtl', nested: true })
				)
				flushSync()

				// In horizontal mode, up/down for expand/collapse is not affected by RTL
				root.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }))
				expect(wrapper.expand).toHaveBeenCalled()

				root.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }))
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

		describe('anchor clicks', () => {
			beforeEach(() => {
				root.innerHTML = `
          <a href="#page-1" data-path="0">Link 1</a>
          <a href="#page-2" data-path="1"><span>Link 2 inner</span></a>
          <div data-path="2">Button</div>
        `
			})

			it('should not call preventDefault on anchor click', () => {
				const cleanup = $effect.root(() => navigator(root, { wrapper }))
				flushSync()

				wrapper.select.mockReturnValue(true)
				const anchor = root.querySelector('a[href]')
				const event = new MouseEvent('click', { bubbles: true, cancelable: true })
				const preventDefaultSpy = vi.spyOn(event, 'preventDefault')
				anchor.dispatchEvent(event)

				expect(preventDefaultSpy).not.toHaveBeenCalled()
				cleanup()
			})

			it('should still call wrapper.select and emit action on anchor click', () => {
				const cleanup = $effect.root(() => navigator(root, { wrapper }))
				flushSync()

				wrapper.select.mockReturnValue(true)
				const anchor = root.querySelector('a[href]')
				anchor.click()

				expect(wrapper.select).toHaveBeenCalledWith('0')
				expect(action).toHaveBeenCalled()
				cleanup()
			})

			it('should not call preventDefault on Enter keydown for anchor element', () => {
				const cleanup = $effect.root(() => navigator(root, { wrapper }))
				flushSync()

				// Dispatch on the anchor so event.target is the anchor, then it bubbles to root
				const anchor = root.querySelector('a[href]')
				const event = new KeyboardEvent('keydown', {
					key: 'Enter',
					bubbles: true,
					cancelable: true
				})
				const preventDefaultSpy = vi.spyOn(event, 'preventDefault')
				anchor.dispatchEvent(event)

				expect(preventDefaultSpy).not.toHaveBeenCalled()
				cleanup()
			})

			it('should not call preventDefault on Space keydown for anchor element', () => {
				const cleanup = $effect.root(() => navigator(root, { wrapper }))
				flushSync()

				// Dispatch on the anchor so event.target is the anchor, then it bubbles to root
				const anchor = root.querySelector('a[href]')
				const event = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true })
				const preventDefaultSpy = vi.spyOn(event, 'preventDefault')
				anchor.dispatchEvent(event)

				expect(preventDefaultSpy).not.toHaveBeenCalled()
				cleanup()
			})

			it('should not call preventDefault when clicking a child element inside an anchor', () => {
				const cleanup = $effect.root(() => navigator(root, { wrapper }))
				flushSync()

				wrapper.select.mockReturnValue(true)
				const innerSpan = root.querySelector('a[href] span')
				const event = new MouseEvent('click', { bubbles: true, cancelable: true })
				const preventDefaultSpy = vi.spyOn(event, 'preventDefault')
				innerSpan.dispatchEvent(event)

				expect(preventDefaultSpy).not.toHaveBeenCalled()
				cleanup()
			})

			it('should call preventDefault on non-anchor element click', () => {
				const cleanup = $effect.root(() => navigator(root, { wrapper }))
				flushSync()

				wrapper.select.mockReturnValue(true)
				const div = root.querySelector('div[data-path]')
				const event = new MouseEvent('click', { bubbles: true, cancelable: true })
				const preventDefaultSpy = vi.spyOn(event, 'preventDefault')
				div.dispatchEvent(event)

				expect(preventDefaultSpy).toHaveBeenCalled()
				cleanup()
			})
		})
	})

	describe('typeahead', () => {
		const typeaheadWrapper = {
			...wrapper,
			findByText: vi.fn(),
			focusedKey: '0'
		}

		afterEach(() => {
			vi.clearAllMocks()
			vi.useRealTimers()
		})

		it('should not trigger typeahead when disabled (default)', () => {
			const cleanup = $effect.root(() =>
				navigator(root, { wrapper: typeaheadWrapper, orientation: 'vertical' })
			)
			flushSync()

			root.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }))
			expect(typeaheadWrapper.findByText).not.toHaveBeenCalled()

			cleanup()
		})

		it('should call findByText on letter key when typeahead enabled', () => {
			typeaheadWrapper.findByText.mockReturnValue('1')
			typeaheadWrapper.moveTo.mockReturnValue(true)

			const cleanup = $effect.root(() =>
				navigator(root, { wrapper: typeaheadWrapper, orientation: 'vertical', typeahead: true })
			)
			flushSync()

			root.dispatchEvent(new KeyboardEvent('keydown', { key: 'b' }))
			expect(typeaheadWrapper.findByText).toHaveBeenCalledWith('b', '0')
			expect(typeaheadWrapper.moveTo).toHaveBeenCalledWith('1')

			cleanup()
		})

		it('should accumulate buffer for multi-char search', () => {
			vi.useFakeTimers()
			typeaheadWrapper.findByText.mockReturnValue(null)

			const cleanup = $effect.root(() =>
				navigator(root, { wrapper: typeaheadWrapper, orientation: 'vertical', typeahead: true })
			)
			flushSync()

			root.dispatchEvent(new KeyboardEvent('keydown', { key: 'b' }))
			expect(typeaheadWrapper.findByText).toHaveBeenCalledWith('b', '0')

			root.dispatchEvent(new KeyboardEvent('keydown', { key: 'e' }))
			expect(typeaheadWrapper.findByText).toHaveBeenCalledWith('be', null)

			root.dispatchEvent(new KeyboardEvent('keydown', { key: 't' }))
			expect(typeaheadWrapper.findByText).toHaveBeenCalledWith('bet', null)

			cleanup()
			vi.useRealTimers()
		})

		it('should reset buffer after 500ms', () => {
			vi.useFakeTimers()
			typeaheadWrapper.findByText.mockReturnValue(null)

			const cleanup = $effect.root(() =>
				navigator(root, { wrapper: typeaheadWrapper, orientation: 'vertical', typeahead: true })
			)
			flushSync()

			root.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }))
			expect(typeaheadWrapper.findByText).toHaveBeenCalledWith('a', '0')

			vi.advanceTimersByTime(500)

			root.dispatchEvent(new KeyboardEvent('keydown', { key: 'b' }))
			// After reset, buffer starts fresh with 'b', and startAfter = focusedKey
			expect(typeaheadWrapper.findByText).toHaveBeenCalledWith('b', '0')

			cleanup()
			vi.useRealTimers()
		})

		it('should emit move action on match', () => {
			typeaheadWrapper.findByText.mockReturnValue('2')
			typeaheadWrapper.moveTo.mockReturnValue(true)

			const cleanup = $effect.root(() =>
				navigator(root, { wrapper: typeaheadWrapper, orientation: 'vertical', typeahead: true })
			)
			flushSync()

			root.dispatchEvent(new KeyboardEvent('keydown', { key: 'g' }))
			expect(action).toHaveBeenCalledTimes(1)
			expect(action.mock.calls[0][0].detail.name).toBe('move')

			cleanup()
		})

		it('should not trigger on modifier keys', () => {
			const cleanup = $effect.root(() =>
				navigator(root, { wrapper: typeaheadWrapper, orientation: 'vertical', typeahead: true })
			)
			flushSync()

			root.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', ctrlKey: true }))
			root.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', metaKey: true }))
			root.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', altKey: true }))
			expect(typeaheadWrapper.findByText).not.toHaveBeenCalled()

			cleanup()
		})

		it('should not trigger on space key', () => {
			const cleanup = $effect.root(() =>
				navigator(root, { wrapper: typeaheadWrapper, orientation: 'vertical', typeahead: true })
			)
			flushSync()

			// Space is handled by select action, not typeahead
			typeaheadWrapper.select.mockReturnValue(false)
			root.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }))
			expect(typeaheadWrapper.findByText).not.toHaveBeenCalled()

			cleanup()
		})

		it('should reset buffer on navigation action', () => {
			vi.useFakeTimers()
			typeaheadWrapper.findByText.mockReturnValue(null)
			typeaheadWrapper.moveNext.mockReturnValue(true)

			const cleanup = $effect.root(() =>
				navigator(root, { wrapper: typeaheadWrapper, orientation: 'vertical', typeahead: true })
			)
			flushSync()

			root.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }))
			expect(typeaheadWrapper.findByText).toHaveBeenCalledWith('a', '0')

			// Navigation action should reset buffer
			root.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }))

			// Next letter should start fresh buffer
			root.dispatchEvent(new KeyboardEvent('keydown', { key: 'b' }))
			expect(typeaheadWrapper.findByText).toHaveBeenCalledWith('b', '0')

			cleanup()
			vi.useRealTimers()
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
		expect(addEventListenerSpy).toHaveBeenNthCalledWith(1, 'keydown', expect.any(Function), {})
		expect(addEventListenerSpy).toHaveBeenNthCalledWith(2, 'click', expect.any(Function), {})

		cleanup()
		expect(removeEventListenerSpy).toHaveBeenCalledTimes(2)
		expect(removeEventListenerSpy).toHaveBeenNthCalledWith(1, 'keydown', expect.any(Function), {})
		expect(removeEventListenerSpy).toHaveBeenNthCalledWith(2, 'click', expect.any(Function), {})

		addEventListenerSpy.mockRestore()
		removeEventListenerSpy.mockRestore()
	})
})

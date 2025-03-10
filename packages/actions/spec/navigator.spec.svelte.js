import { vi, it, expect, describe, beforeEach, afterEach } from 'vitest'
import { flushSync } from 'svelte'
import { navigator } from '../src/navigator.svelte.js'
import { toHaveBeenDispatchedWith } from '@rokkit/helpers/matchers'
import { fireEvent } from '@testing-library/svelte'

expect.extend({ toHaveBeenDispatchedWith })

describe('navigator', () => {
	const root = document.createElement('div')
	const wrapper = {
		moveNext: vi.fn(),
		movePrev: vi.fn(),
		select: vi.fn(),
		expand: vi.fn(),
		collapse: vi.fn(),
		toggleExpansion: vi.fn()
	}

	// Setup test DOM structure
	beforeEach(() => {
		root.innerHTML = `
      <div data-path="0">Item 1
        <rk-icon data-state="closed"></rk-icon>
        <div data-path="0-0">Child 1</div>
        <div data-path="0-1">Child 2</div>
      </div>
      <div data-path="1">Item 2
        <rk-icon data-state="opened"></rk-icon>
      </div>
    `
	})

	afterEach(() => {
		vi.clearAllMocks()
	})

	describe('keyboard navigation - vertical', () => {
		it('should handle vertical navigation keys', () => {
			const cleanup = $effect.root(() => navigator(root, { wrapper }))
			flushSync()

			root.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowDown' }))
			expect(wrapper.moveNext).toHaveBeenCalled()

			root.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowUp' }))
			expect(wrapper.movePrev).toHaveBeenCalled()

			root.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowRight' }))
			expect(wrapper.expand).toHaveBeenCalled()

			root.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowLeft' }))
			expect(wrapper.collapse).toHaveBeenCalled()

			root.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter' }))
			expect(wrapper.select).toHaveBeenCalled()

			cleanup()
		})
	})

	describe('keyboard navigation - horizontal', () => {
		it('should handle horizontal navigation keys', () => {
			const cleanup = $effect.root(() =>
				navigator(root, {
					wrapper,
					options: { direction: 'horizontal' }
				})
			)
			flushSync()

			root.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowRight' }))
			expect(wrapper.moveNext).toHaveBeenCalled()

			root.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowLeft' }))
			expect(wrapper.movePrev).toHaveBeenCalled()

			root.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowDown' }))
			expect(wrapper.expand).toHaveBeenCalled()

			root.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowUp' }))
			expect(wrapper.collapse).toHaveBeenCalled()

			root.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter' }))
			expect(wrapper.select).toHaveBeenCalled()

			cleanup()
		})
	})

	describe('click handling', () => {
		it('should handle item click', () => {
			const cleanup = $effect.root(() =>
				navigator(root, {
					wrapper,
					options: { direction: 'vertical' }
				})
			)
			flushSync()

			const item = root.querySelector('[data-path="0"]')
			item.click()

			expect(wrapper.select).toHaveBeenCalledWith([0], false)
			expect(wrapper.toggleExpansion).toHaveBeenCalled()

			cleanup()
		})

		it('should handle icon click for expansion', () => {
			const cleanup = $effect.root(() =>
				navigator(root, {
					wrapper,
					options: { direction: 'vertical' }
				})
			)
			flushSync()

			const icon = root.querySelector('[data-state="closed"]')
			icon.click()

			expect(wrapper.select).toHaveBeenCalledWith([0], false)
			expect(wrapper.expand).toHaveBeenCalled()
			expect(wrapper.toggleExpansion).not.toHaveBeenCalled()

			cleanup()
		})

		it('should handle icon click for collapse', () => {
			const cleanup = $effect.root(() =>
				navigator(root, {
					wrapper,
					options: { direction: 'vertical' }
				})
			)
			flushSync()

			const icon = root.querySelector('[data-state="opened"]')
			icon.click()

			expect(wrapper.select).toHaveBeenCalledWith([1], false)
			expect(wrapper.collapse).toHaveBeenCalled()
			expect(wrapper.toggleExpansion).not.toHaveBeenCalled()

			cleanup()
		})

		it('should handle modifier keys during selection', () => {
			const cleanup = $effect.root(() =>
				navigator(root, {
					wrapper,
					options: { direction: 'vertical' }
				})
			)
			flushSync()

			const item = root.querySelector('[data-path="0"]')
			fireEvent.click(item, { ctrlKey: true })

			expect(wrapper.select).toHaveBeenCalledWith([0], true)

			cleanup()
		})
	})

	it('should cleanup event listeners', () => {
		const addEventListenerSpy = vi.spyOn(root, 'addEventListener')
		const removeEventListenerSpy = vi.spyOn(root, 'removeEventListener')

		const cleanup = $effect.root(() =>
			navigator(root, {
				wrapper,
				options: { direction: 'vertical' }
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

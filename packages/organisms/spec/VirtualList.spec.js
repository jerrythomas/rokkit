import { describe, expect, it, beforeEach, afterAll, vi } from 'vitest'
import { cleanup, render, fireEvent } from '@testing-library/svelte'
import { getPropertyValue, toHaveBeenDispatchedWith } from 'validators'
import { tick } from 'svelte'

import MockItem from './mocks/MockItem.svelte'
import VirtualList from '../src/Virtual.svelte'
import MockVirtualListSlot from './mocks/MockVirtualListSlot.svelte'

expect.extend({ toHaveBeenDispatchedWith })

describe('VirtualList.svelte', () => {
	let scroll = { left: 0, top: 0 }
	Element.prototype.scrollTo = vi.fn().mockImplementation((left, top) => {
		scroll = { left, top }
	})
	Object.defineProperty(Element.prototype, 'scrollTop', {
		get: () => scroll.top
	})
	Object.defineProperty(Element.prototype, 'scrollLeft', {
		get: () => scroll.left
	})

	const events = ['select']
	const items = Array.from({ length: 10 }, (_, i) => `Item ${i + 1}`)

	let handlers = {}

	beforeEach(() => {
		cleanup()
		events.map((e) => (handlers[e] = vi.fn()))
	})

	afterAll(() => vi.resetAllMocks())

	describe('render', () => {
		it('should render', async () => {
			const { container } = render(VirtualList, {
				items,
				limit: 5
			})
			const wrapper = container.querySelector('virtual-list-viewport')
			expect(wrapper).toMatchSnapshot()
			const content = container.querySelectorAll('virtual-list-item')
			expect(content.length).toBe(5)
		})

		it('should render using slot', async () => {
			const { container } = render(MockVirtualListSlot, {
				items,
				limit: 5
			})
			const wrapper = container.querySelector('virtual-list-viewport')
			expect(wrapper).toMatchSnapshot()
			const content = container.querySelectorAll('virtual-list-item')
			expect(content.length).toBe(5)
		})
	})

	describe('vertical', () => {
		it('should select item on enter', async () => {})
		it('should select item on space', async () => {})
		it('should move to next item on down arrow', async () => {})
		it('should move to previous item on up arrow', async () => {})
		it('should move to first item on home', async () => {})
		it('should move to last item on end', async () => {})
		it('should jump forward by offset on page down', async () => {})
		it('should jump backward by offset on page up', async () => {})
		it('should select item on click', async () => {})
		it('should jump forward on scroll down', async () => {})
		it('should jump backward on scroll up', async () => {})
	})

	describe('horizontal', () => {
		it('should move to next on right arrow', async () => {})
		it('should move to previous on left arrow', async () => {})
		it('should jump forward on scroll right', async () => {})
		it('should jump backward on scroll right', async () => {})
	})
})

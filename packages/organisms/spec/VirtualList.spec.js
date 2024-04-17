import { describe, expect, it, beforeEach, afterAll, vi } from 'vitest'
import { cleanup, render, fireEvent } from '@testing-library/svelte'
import { toHaveBeenDispatchedWith } from 'validators'
import { tick } from 'svelte'

import VirtualList from '../src/VirtualList.svelte'
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

	const events = ['select', 'move']
	const items = Array.from({ length: 10 }, (_, i) => `Item ${i + 1}`)

	let handlers = {}

	beforeEach(() => {
		cleanup()
		events.forEach((e) => (handlers[e] = vi.fn()))
	})

	afterAll(() => vi.resetAllMocks())

	describe('render', () => {
		it('should render', () => {
			const { container } = render(VirtualList, {
				items,
				limit: 5
			})
			const wrapper = container.querySelector('virtual-list-viewport')
			expect(wrapper).toMatchSnapshot()
			const content = container.querySelectorAll('virtual-list-item')
			expect(content.length).toBe(5)
		})

		it('should render using slot', () => {
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
		it('should do nothing on unsupported key', async () => {
			const { container, component } = render(VirtualList, {
				items,
				limit: 5
			})
			component.$on('select', handlers.select)
			component.$on('move', handlers.move)
			const wrapper = container.querySelector('virtual-list-viewport')
			await fireEvent.keyDown(wrapper, { key: 'ArrowLeft' })
			await tick()
			expect(handlers.select).not.toHaveBeenCalled()
			expect(handlers.move).not.toHaveBeenCalled()
			await fireEvent.keyDown(wrapper, { key: 'ArrowRight' })
			await tick()
			expect(handlers.select).not.toHaveBeenCalled()
			expect(handlers.move).not.toHaveBeenCalled()
		})

		it('should move to next item on down arrow', async () => {
			const { container, component } = render(VirtualList, {
				items,
				limit: 5
			})
			component.$on('select', handlers.select)
			component.$on('move', handlers.move)
			const wrapper = container.querySelector('virtual-list-viewport')
			const content = container.querySelectorAll('virtual-list-item')
			expect(content.length).toBe(5)
			await fireEvent.keyDown(wrapper, { key: 'ArrowDown' })
			await tick()
			expect(wrapper).toMatchSnapshot()
			expect(handlers.select).not.toHaveBeenCalled()
			expect(handlers.move).toHaveBeenDispatchedWith({
				value: items[0],
				index: 0
			})
		})
		it('should move to previous item on up arrow', async () => {
			const { container, component } = render(VirtualList, {
				items,
				value: items[5],
				limit: 5
			})
			component.$on('select', handlers.select)
			component.$on('move', handlers.move)
			const wrapper = container.querySelector('virtual-list-viewport')
			const content = container.querySelectorAll('virtual-list-item')
			expect(content.length).toBe(5)
			await fireEvent.keyDown(wrapper, { key: 'ArrowUp' })
			await tick()
			expect(wrapper).toMatchSnapshot()
			expect(handlers.select).not.toHaveBeenCalled()
			expect(handlers.move).toHaveBeenDispatchedWith({
				value: items[4],
				index: 4
			})
		})
		it('should select item on enter', async () => {
			const { container, component } = render(VirtualList, {
				items,
				value: items[4],
				limit: 5
			})
			component.$on('select', handlers.select)
			component.$on('move', handlers.move)
			const wrapper = container.querySelector('virtual-list-viewport')
			const content = container.querySelectorAll('virtual-list-item')
			expect(content.length).toBe(5)
			await fireEvent.keyDown(wrapper, { key: 'Enter' })
			await tick()
			expect(wrapper).toMatchSnapshot()
			expect(handlers.move).not.toHaveBeenCalled()
			expect(handlers.select).toHaveBeenDispatchedWith({
				value: items[4],
				index: 4
			})
		})
		it('should select item on space', async () => {
			const { container, component } = render(VirtualList, {
				items,
				value: items[4],
				limit: 5
			})
			component.$on('select', handlers.select)
			component.$on('move', handlers.move)
			const wrapper = container.querySelector('virtual-list-viewport')
			const content = container.querySelectorAll('virtual-list-item')
			expect(content.length).toBe(5)
			await fireEvent.keyDown(wrapper, { key: ' ' })
			await tick()
			expect(wrapper).toMatchSnapshot()
			expect(handlers.move).not.toHaveBeenCalled()
			expect(handlers.select).toHaveBeenDispatchedWith({
				value: items[4],
				index: 4
			})
		})
		it('should move to first item on home', async () => {
			const { container, component } = render(VirtualList, {
				items,
				value: items[4],
				limit: 5
			})
			component.$on('select', handlers.select)
			component.$on('move', handlers.move)
			const wrapper = container.querySelector('virtual-list-viewport')
			const content = container.querySelectorAll('virtual-list-item')
			expect(content.length).toBe(5)
			await fireEvent.keyDown(wrapper, { key: 'Home' })
			await tick()
			expect(wrapper).toMatchSnapshot()
			expect(handlers.select).not.toHaveBeenCalled()
			expect(handlers.move).toHaveBeenDispatchedWith({
				value: items[0],
				index: 0
			})
		})
		it('should move to last item on end', async () => {
			const { container, component } = render(VirtualList, {
				items,
				value: items[4],
				limit: 5
			})
			component.$on('select', handlers.select)
			component.$on('move', handlers.move)
			const wrapper = container.querySelector('virtual-list-viewport')
			const content = container.querySelectorAll('virtual-list-item')
			expect(content.length).toBe(5)
			await fireEvent.keyDown(wrapper, { key: 'End' })
			await tick()
			expect(wrapper).toMatchSnapshot()
			expect(handlers.select).not.toHaveBeenCalled()
			expect(handlers.move).toHaveBeenDispatchedWith({
				value: items[9],
				index: 9
			})
		})
		it('should jump forward by offset on page down', async () => {
			const { container, component } = render(VirtualList, {
				items,
				value: items[4],
				limit: 5
			})
			component.$on('select', handlers.select)
			component.$on('move', handlers.move)

			const wrapper = container.querySelector('virtual-list-viewport')
			const content = container.querySelectorAll('virtual-list-item')
			expect(content.length).toBe(5)

			await fireEvent.keyDown(wrapper, { key: 'PageDown' })
			await tick()
			expect(wrapper).toMatchSnapshot()
			expect(handlers.select).not.toHaveBeenCalled()
			expect(handlers.move).toHaveBeenDispatchedWith({
				value: items[9],
				index: 9
			})
		})
		it('should jump backward by offset on page up', async () => {
			const { container, component } = render(VirtualList, {
				items,
				value: items[9],
				limit: 5
			})
			component.$on('select', handlers.select)
			component.$on('move', handlers.move)

			const wrapper = container.querySelector('virtual-list-viewport')
			const content = container.querySelectorAll('virtual-list-item')
			expect(content.length).toBe(5)

			await fireEvent.keyDown(wrapper, { key: 'PageUp' })
			await tick()
			expect(wrapper).toMatchSnapshot()
			expect(handlers.select).not.toHaveBeenCalled()
			expect(handlers.move).toHaveBeenDispatchedWith({
				value: items[4],
				index: 4
			})
		})
		it('should select item on click', async () => {
			const { container, component } = render(VirtualList, {
				items,
				limit: 5
			})
			component.$on('select', handlers.select)
			component.$on('move', handlers.move)

			const wrapper = container.querySelector('virtual-list-viewport')
			const content = container.querySelectorAll('virtual-list-item')
			expect(content.length).toBe(5)

			await fireEvent.click(content[1])
			await tick()
			expect(wrapper).toMatchSnapshot()
			expect(handlers.move).not.toHaveBeenCalled()
			expect(handlers.select).toHaveBeenDispatchedWith({
				value: items[1],
				index: 1
			})
		})
		// it('should jump forward on scroll down', async () => {})
		// it('should jump backward on scroll up', async () => {})
	})

	describe('horizontal', () => {
		it('should do nothing on unsupported key', async () => {
			const { container, component } = render(VirtualList, {
				items,
				limit: 5,
				horizontal: true
			})
			component.$on('select', handlers.select)
			component.$on('move', handlers.move)
			const wrapper = container.querySelector('virtual-list-viewport')
			await fireEvent.keyDown(wrapper, { key: 'ArrowUp' })
			await tick()
			expect(handlers.select).not.toHaveBeenCalled()
			expect(handlers.move).not.toHaveBeenCalled()
			await fireEvent.keyDown(wrapper, { key: 'ArrowDown' })
			await tick()
			expect(handlers.select).not.toHaveBeenCalled()
			expect(handlers.move).not.toHaveBeenCalled()
		})
		it('should move to next on right arrow', async () => {
			const { container, component } = render(VirtualList, {
				items,
				limit: 5,
				horizontal: true
			})
			component.$on('select', handlers.select)
			component.$on('move', handlers.move)
			const wrapper = container.querySelector('virtual-list-viewport')
			const content = container.querySelectorAll('virtual-list-item')
			expect(content.length).toBe(5)
			await fireEvent.keyDown(wrapper, { key: 'ArrowRight' })
			await tick()
			expect(wrapper).toMatchSnapshot()
			expect(handlers.select).not.toHaveBeenCalled()
			expect(handlers.move).toHaveBeenDispatchedWith({
				value: items[0],
				index: 0
			})
		})
		it('should move to previous on left arrow', async () => {
			const { container, component } = render(VirtualList, {
				items,
				limit: 5,
				horizontal: true,
				value: items[5]
			})
			component.$on('select', handlers.select)
			component.$on('move', handlers.move)
			const wrapper = container.querySelector('virtual-list-viewport')
			const content = container.querySelectorAll('virtual-list-item')
			expect(content.length).toBe(5)
			await fireEvent.keyDown(wrapper, { key: 'ArrowLeft' })
			await tick()
			expect(wrapper).toMatchSnapshot()
			expect(handlers.select).not.toHaveBeenCalled()
			expect(handlers.move).toHaveBeenDispatchedWith({
				value: items[4],
				index: 4
			})
		})
		// it('should jump forward on scroll right', async () => {})
		// it('should jump backward on scroll right', async () => {})
	})
})

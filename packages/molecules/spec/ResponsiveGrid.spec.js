import { describe, expect, it, vi, beforeEach } from 'vitest'
import { cleanup, fireEvent, render } from '@testing-library/svelte'
import { getPropertyValue, simulateTouchSwipe } from 'validators'
import MockItem from './mocks/Custom.svelte'
import { tick } from 'svelte'
import ResponsiveGrid from '../src/ResponsiveGrid.svelte'

describe('ResponsiveGrid.svelte', () => {
	let items = [
		{ component: MockItem, props: { value: ' Content for A' } },
		{ component: MockItem, props: { value: ' Content for B' } },
		{ component: MockItem, props: { value: ' Content for C' } }
	]

	beforeEach(() => {
		cleanup()
		global.Touch = vi.fn().mockImplementation((input) => input)
	})

	it('should render a responsive grid', () => {
		const { container } = render(ResponsiveGrid, {
			items,
			value: items[0],
			small: false
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})

	it('should render a responsive grid for small devices', () => {
		const { container } = render(ResponsiveGrid, { items, value: items[0] })
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})

	it('should switch columns on left and right arrow keys', async () => {
		const { container, component } = render(ResponsiveGrid, {
			items,
			value: items[0]
		})
		const grid = container.querySelector('container')
		await fireEvent.keyDown(grid, { key: 'ArrowRight' })
		await tick()
		expect(getPropertyValue(component, 'value')).toBe(items[1])
		await fireEvent.keyDown(grid, { key: 'ArrowLeft' })
		await tick()
		expect(getPropertyValue(component, 'value')).toBe(items[0])
		component.$set({ small: false })
		await tick()
		await fireEvent.keyDown(grid, { key: 'ArrowRight' })
		await tick()
		expect(getPropertyValue(component, 'value')).toBe(items[0])
		await fireEvent.keyDown(grid, { key: 'ArrowLeft' })
		await tick()
		expect(getPropertyValue(component, 'value')).toBe(items[0])
	})
	it('should switch columns on swipe', async () => {
		const { container, component } = render(ResponsiveGrid, {
			items,
			value: items[0]
		})
		let grid = container.querySelector('container')
		simulateTouchSwipe(grid, { x: -100, y: 10 })
		await tick()
		expect(getPropertyValue(component, 'value')).toBe(items[1])
		simulateTouchSwipe(grid, { x: 100, y: 10 })
		await tick()
		expect(getPropertyValue(component, 'value')).toBe(items[0])

		component.$set({ small: false })
		await tick()
		grid = container.querySelector('container')
		expect(getPropertyValue(component, 'value')).toBe(items[0])
		simulateTouchSwipe(grid, { x: -100, y: 10 })
		await tick()
		expect(getPropertyValue(component, 'value')).toBe(items[0])
		simulateTouchSwipe(grid, { x: 100, y: 10 })
		await tick()
		expect(getPropertyValue(component, 'value')).toBe(items[0])
	})

	it('should handle prop updates', async () => {
		const { component, container } = render(ResponsiveGrid, {
			items
		})
		items[0].props.value = 'New Content for A'
		const grid = container.querySelector('container')
		component.$set({ items, class: 'test-class' })
		await tick()
		expect(container).toMatchSnapshot()
		expect(Array.from(grid.classList)).toContain('test-class')
	})

	it('should handle prop updates for large', async () => {
		const { component, container } = render(ResponsiveGrid, {
			items,
			small: false
		})
		items[0].props.value = 'New Content for A'
		const grid = container.querySelector('container')
		component.$set({ items, class: 'test-class' })
		await tick()
		expect(container).toMatchSnapshot()
		expect(Array.from(grid.classList)).toContain('test-class')
	})
})

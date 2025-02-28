import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { cleanup, fireEvent, render } from '@testing-library/svelte'
import { simulateTouchSwipe } from '@rokkit/helpers/simulators'
import { MockItem } from '@rokkit/helpers/components'
import '@rokkit/helpers/mocks'
import { tick } from 'svelte'
import ResponsiveGrid from '../src/ResponsiveGrid.svelte'

describe('ResponsiveGrid.svelte', () => {
	const items = [
		{ component: MockItem, props: { value: ' Content for A' } },
		{ component: MockItem, props: { value: ' Content for B' } },
		{ component: MockItem, props: { value: ' Content for C' } }
	]

	beforeEach(() => {
		vi.useFakeTimers()
		cleanup()
		global.Touch = vi.fn().mockImplementation((input) => input)
	})
	afterEach(() => vi.useRealTimers())

	it('should render a responsive grid', () => {
		const props = $state({
			items,
			value: items[0],
			small: false
		})
		const { container } = render(ResponsiveGrid, { props })
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})

	it('should render a responsive grid for small devices', () => {
		const props = $state({ items, value: items[0] })
		const { container } = render(ResponsiveGrid, { props })
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})

	it('should switch columns on left and right arrow keys', async () => {
		const props = $state({
			items,
			value: items[0]
		})
		const { container } = render(ResponsiveGrid, { props })
		const grid = container.querySelector('container')
		await fireEvent.keyDown(grid, { key: 'ArrowRight' })
		await tick()
		expect(container).toMatchSnapshot()
		await fireEvent.keyDown(grid, { key: 'ArrowLeft' })
		await tick()
		// expect(getPropertyValue(component, 'value')).toBe(items[0])
		props.small = false
		await tick()
		await fireEvent.keyDown(grid, { key: 'ArrowRight' })
		await tick()
		expect(container).toMatchSnapshot()
		// expect(getPropertyValue(component, 'value')).toBe(items[0])
		await fireEvent.keyDown(grid, { key: 'ArrowLeft' })
		await tick()
		expect(container).toMatchSnapshot()
		// expect(getPropertyValue(component, 'value')).toBe(items[0])
	})
	it('should switch columns on swipe', async () => {
		const props = $state({
			items,
			value: items[0]
		})
		const { container } = render(ResponsiveGrid, { props })
		let grid = container.querySelector('container')
		simulateTouchSwipe(grid, { x: -100, y: 10 })
		await tick()
		// expect(getPropertyValue(component, 'value')).toBe(items[1])
		simulateTouchSwipe(grid, { x: 100, y: 10 })
		await tick()
		// expect(getPropertyValue(component, 'value')).toBe(items[0])

		props.small = false

		await tick()
		grid = container.querySelector('container')
		// expect(getPropertyValue(component, 'value')).toBe(items[0])
		simulateTouchSwipe(grid, { x: -100, y: 10 })
		await tick()
		// expect(getPropertyValue(component, 'value')).toBe(items[0])
		simulateTouchSwipe(grid, { x: 100, y: 10 })
		await tick()
		// expect(getPropertyValue(component, 'value')).toBe(items[0])
	})

	it('should handle prop updates', async () => {
		const props = $state({ items })
		const { container } = render(ResponsiveGrid, { props })
		props.items[0].props.value = 'New Content for A'
		// const grid = container.querySelector('container')
		// setProperties(component, { items, class: 'test-class' })
		await tick()
		expect(container).toMatchSnapshot()
		// expect(Array.from(grid.classList)).toContain('test-class')
	})

	it('should handle prop updates for large', async () => {
		const props = $state({
			items,
			small: false
		})
		const { container } = render(ResponsiveGrid, { props })
		items[0].props.value = 'New Content for A'
		const grid = container.querySelector('container')
		props.class = 'test-class'

		await tick()
		expect(container).toMatchSnapshot()
		expect(Array.from(grid.classList)).toContain('test-class')
	})
})

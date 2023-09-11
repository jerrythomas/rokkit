import { describe, expect, it, beforeEach, afterAll, vi } from 'vitest'
import { cleanup, render, fireEvent } from '@testing-library/svelte'
import { getPropertyValue, toHaveBeenDispatchedWith } from 'validators'
import { tick } from 'svelte'

import MockItem from './mocks/MockItem.svelte'
import Select from '../src/VirtualSelect.svelte'

expect.extend({ toHaveBeenDispatchedWith })

describe('VirtualSelect.svelte', () => {
	let scroll = { left: 0, top: 0 }

	Element.prototype.scrollTo = vi.fn().mockImplementation((left, top) => {
		scroll = { left, top }
	})

	Object.defineProperty(Element.prototype, 'scrollTop', {
		get: () => scroll.top
	})

	const events = ['change', 'select']
	const items = Array.from({ length: 10 }, (_, i) => `Item ${i + 1}`)

	let handlers = {}

	beforeEach(() => {
		cleanup()
		events.map((e) => (handlers[e] = vi.fn()))
	})
	afterAll(() => vi.resetAllMocks())

	it('should render string array', async () => {
		const { container } = render(Select, {
			options: items
		})
		expect(container).toMatchSnapshot()
		const selector = container.querySelector('selected-item')
		await fireEvent.click(selector)
		await tick()

		expect(container).toMatchSnapshot()
	})

	it('should render object array', async () => {
		const { container } = render(Select, {
			options: items.map((item) => ({ text: item }))
		})
		expect(container).toMatchSnapshot()
		const selector = container.querySelector('selected-item')
		await fireEvent.click(selector)
		await tick()

		expect(container).toMatchSnapshot()
	})

	it('should render with selected value', async () => {
		const { container } = render(Select, {
			options: items,
			value: 'Item 3'
		})
		expect(container).toMatchSnapshot()

		const selector = container.querySelector('selected-item')
		await fireEvent.click(selector)
		await tick()
		expect(container).toMatchSnapshot()
	})

	it('should close the dropdown when focus is lost', async () => {
		const { container } = render(Select, {
			options: items
		})
		const selector = container.querySelector('selected-item')
		await fireEvent.click(selector)
		await tick()

		await fireEvent.blur(selector)
		await tick()
		expect(container).toMatchSnapshot()
	})
})

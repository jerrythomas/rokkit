import { describe, expect, it, beforeEach, vi } from 'vitest'
import { cleanup, render, fireEvent } from '@testing-library/svelte'
import { tick } from 'svelte'
// import { toHaveBeenCalledWith } from 'validators'
// import { getSpyDetail } from '../helper'
import Toggle from '../src/Toggle.svelte'

// expect.extend({ toHaveBeenCalledWith })

describe('Toggle.svelte', () => {
	const keys = [' ', 'Enter', 'ArrowLeft', 'ArrowRight']
	beforeEach(() => cleanup())

	it('should render default', async () => {
		const { container, component } = render(Toggle)
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()

		let text = container.querySelector('p')
		expect(text.textContent).toEqual('false')

		// handle value change
		setProperties(component, { value: true })
		await tick()
		text = container.querySelector('p')
		expect(text.textContent).toEqual('true')
	})

	it('should handle click', async () => {
		const handle = vi.fn()
		const { container, component } = render(Toggle)
		expect(container).toBeTruthy()
		component.$on('change', handle)
		const toggle = container.querySelector('toggle')
		await fireEvent.click(toggle)
		await tick()
		let text = container.querySelector('p')
		expect(text.textContent).toEqual('true')
		// expect(handle).toHaveBeenCalled()
		// expect(getSpyDetail(handle)).toEqual(true)
		expect(handle).toHaveBeenCalledWith(true)

		await fireEvent.click(toggle)
		await tick()
		text = container.querySelector('p')
		expect(text.textContent).toEqual('false')
		// expect(handle).toHaveBeenCalled()
		// expect(getSpyDetail(handle)).toEqual(false)
		expect(handle).toHaveBeenCalledWith(false)
	})

	it.each(keys)('should handle key [%s]', async (key) => {
		const handle = vi.fn()
		const { container, component } = render(Toggle)
		expect(container).toBeTruthy()
		component.$on('change', handle)
		const toggle = container.querySelector('toggle')
		await fireEvent.keyDown(toggle, { key })
		await tick()
		let text = container.querySelector('p')
		expect(text.textContent).toEqual('true')
		// expect(handle).toHaveBeenCalled()
		// expect(getSpyDetail(handle)).toEqual(true)
		expect(handle).toHaveBeenCalledWith(true)

		await fireEvent.keyDown(toggle, { key })
		await tick()
		text = container.querySelector('p')
		expect(text.textContent).toEqual('false')
		// expect(handle).toHaveBeenCalled()
		// expect(getSpyDetail(handle)).toEqual(false)
		expect(handle).toHaveBeenCalledWith(false)
	})

	it('should change class', async () => {
		const { container, component } = render(Toggle)
		expect(container).toBeTruthy()
		setProperties(component, { class: 'custom' })
		await tick()
		expect(container).toMatchSnapshot()
	})
})

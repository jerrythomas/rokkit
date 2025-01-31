import { describe, it, expect } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import { tick } from 'svelte'
import Pill from '../src/Pill.svelte'

describe('Pill', () => {
	it('should render', () => {
		const { container } = render(Pill, { value: 'Hello' })
		expect(container).toMatchSnapshot()
	})

	it('should render with icon', () => {
		const { container } = render(Pill, { value: { text: 'Hello', icon: 'world' } })
		expect(container).toMatchSnapshot()
	})

	it('should render with image', () => {
		const { container } = render(Pill, { value: { text: 'Hello', image: 'world.png' } })
		expect(container).toMatchSnapshot()
	})

	it('should render with close button', () => {
		const { container } = render(Pill, { value: 'Hello', removable: true })
		expect(container).toMatchSnapshot()
	})

	it('should render with disabled close button', () => {
		const { container } = render(Pill, { value: 'Hello', removable: true, disabled: true })
		expect(container).toMatchSnapshot()
	})

	it('should fire remove event on click', async () => {
		const props = $state({ value: 'Hello', removable: true, onremove: vi.fn() })
		const { container } = render(Pill, { props })
		const closeButton = container.querySelector('button')
		fireEvent.click(closeButton)
		await tick()
		expect(props.onremove).toHaveBeenCalledWith('Hello')
	})

	it.each(['Delete', 'Backspace'])('should fire remove event on %s', async (key) => {
		const props = $state({ value: 'Hello', removable: true, onremove: vi.fn() })
		const { container } = render(Pill, { props })
		const pill = container.querySelector('rk-pill')
		fireEvent.keyUp(pill, { key })
		await tick()
		expect(props.onremove).toHaveBeenCalledWith('Hello')
	})
})

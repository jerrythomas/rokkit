import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import { flushSync, tick } from 'svelte'
import Pill from '../src/Pill.svelte'

describe('Pill', () => {
	it('should render', () => {
		const props = $state({ value: 'Hello' })
		const { container } = render(Pill, { props })
		expect(container).toMatchSnapshot()

		props.value = 'World'
		flushSync()
		expect(container).toMatchSnapshot()
	})

	it('should render with icon', () => {
		const props = $state({ value: { text: 'Hello', icon: 'world' } })
		const { container } = render(Pill, { props })
		expect(container).toMatchSnapshot()

		props.value = { text: 'World', icon: 'hello' }
		flushSync()
		expect(container).toMatchSnapshot()
	})

	it('should render with image', () => {
		const props = $state({ value: { text: 'Hello', image: 'world.png' } })
		const { container } = render(Pill, { props })
		expect(container).toMatchSnapshot()

		props.value = { text: 'World', image: 'hello.png' }
		flushSync()
		expect(container).toMatchSnapshot()
	})

	it('should fire remove event on click', async () => {
		const props = $state({ value: 'Hello', removable: true, disabled: true, onremove: vi.fn() })
		const { container } = render(Pill, { props })

		expect(container).toMatchSnapshot()
		const closeButton = container.querySelector('rk-icon')

		fireEvent.click(closeButton)
		await tick()
		expect(props.onremove).not.toHaveBeenCalled()

		props.disabled = false
		flushSync()
		expect(container).toMatchSnapshot()
		fireEvent.click(closeButton)
		await tick()
		expect(props.onremove).toHaveBeenCalledWith('Hello')
	})

	it.each(['Delete', 'Backspace'])('should fire remove event on %s', async (key) => {
		const props = $state({ value: 'Hello', removable: true, disabled: true, onremove: vi.fn() })
		const { container } = render(Pill, { props })
		expect(container).toMatchSnapshot()
		const pill = container.querySelector('rk-pill')

		fireEvent.keyUp(pill, { key })
		await tick()
		expect(props.onremove).not.toHaveBeenCalled()

		props.disabled = false
		flushSync()
		expect(container).toMatchSnapshot()
		fireEvent.keyUp(pill, { key })
		expect(props.onremove).toHaveBeenCalledWith('Hello')
	})
})

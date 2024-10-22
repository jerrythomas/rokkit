import { describe, expect, it, vi, beforeEach } from 'vitest'
import { cleanup, fireEvent, render } from '@testing-library/svelte'
import { tick } from 'svelte'
import ButtonGroup from '../src/ButtonGroup.svelte'
import { toHaveBeenDispatchedWith } from 'validators'

expect.extend({ toHaveBeenDispatchedWith })
describe('ButtonGroup.svelte', () => {
	const handlers = {}
	const events = ['click']
	const items = ['One', 'Two', 'Three']
	beforeEach(() => {
		cleanup()
		events.forEach((event) => (handlers[event] = vi.fn()))
	})

	it('should render a button group', () => {
		const { container } = render(ButtonGroup, { props: { items } })
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})

	it('should handle clicks', async () => {
		const { container, component } = render(ButtonGroup, {
			props: {
				items
			},
			events: { click: handlers.click }
		})

		const buttons = container.querySelectorAll('button')
		await fireEvent.click(buttons[0])
		await tick()
		expect(handlers.click).toHaveBeenDispatchedWith(items[0])
	})
})

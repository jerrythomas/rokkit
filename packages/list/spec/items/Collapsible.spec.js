import { describe, expect, it, beforeEach } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
// import { getComponentProp } from 'validators'
// import { defaultFields } from '../constants'
import Collapsible from './Collapsible.svelte'

describe('Collapsible.svelte', () => {
	beforeEach(() => {
		cleanup()
	})

	it('Should render without params', () => {
		const res = render(Collapsible, {
			content: { text: 'hello' }
		})
		expect(res.container).toBeTruthy()
		expect(res.container).toMatchSnapshot()
		// expect(process.stderr.write).toHaveBeenCalledWith(
		// 	"<Collapsible> was created without expected prop 'id'"
		// )
	})
	// it('Should render with name', () => {
	// 	const { container } = render(Collapsible, { id: 1, text: 'Header' })
	// 	expect(container).toBeTruthy()
	// 	expect(container).toMatchSnapshot()
	// 	const span = container.querySelector('.collapsible')
	// 	expect(span.querySelector('p').textContent).toBe('Header')
	// })

	// it('Should collapse and expand on click', async () => {
	// 	const mock = vi.fn()
	// 	const { container, component } = render(Collapsible, {
	// 		id: 1,
	// 		text: 'Hello'
	// 	})
	// 	expect(container).toBeTruthy()
	// 	const span = container.querySelector('.collapsible')

	// 	expect(getComponentProp(component, 'expanded')).toBeFalsy()
	// 	expect(span.querySelector('p').textContent).toBe('Hello')
	// 	expect(span.querySelector('svg').textContent).toBe('Expand')

	// 	component.$on('expand', mock)
	// 	await fireEvent.click(span)

	// 	expect(getComponentProp(component, 'expanded')).toBeTruthy()
	// 	expect(span.querySelector('p').textContent).toBe('Hello')
	// 	expect(span.querySelector('svg').textContent).toBe('Collapse')
	// 	expect(container).toMatchSnapshot('expanded')
	// 	expect(mock).toHaveBeenCalledTimes(1)
	// 	expect(mock.calls[0][0].detail).toEqual({ id: 1 })

	// 	await fireEvent.click(span)
	// 	expect(getComponentProp(component, 'expanded')).toBeFalsy()
	// 	expect(mock).toHaveBeenCalledTimes(1)

	// 	await fireEvent.click(span)
	// 	expect(getComponentProp(component, 'expanded')).toBeTruthy()
	// 	expect(mock).toHaveBeenCalledTimes(2)
	// })
})

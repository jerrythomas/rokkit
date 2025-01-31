import { describe, expect, beforeEach, it } from 'vitest'
import { cleanup, fireEvent, render } from '@testing-library/svelte'
import { flushSync, tick } from 'svelte'
// skipcq: JS-C1003 - Importing all components for verification
import * as components from '../src/index'

describe('HTML Input', () => {
	const names = Object.keys(components).filter(
		(name) =>
			!['InputRadio', 'InputCheckbox', 'InputText', 'InputTextArea', 'InputSelect'].includes(name)
	)

	const customProps = {
		InputRadio: { options: ['foo', 'bar', 'baz'] },
		InputSelect: { options: ['foo', 'bar', 'baz'] }
	}
	const withProps = [['InputNumber', { min: 3, max: 10, value: 4 }]]
	beforeEach(() => cleanup())

	it('should contain all exported components', () => {
		expect(names).toEqual([
			'InputColor',
			'InputDate',
			'InputDateTime',
			'InputEmail',
			'InputFile',
			'InputMonth',
			'InputNumber',
			'InputPassword',
			'InputRange',
			'InputTel',
			'InputTime',
			'InputUrl',
			'InputWeek'
		])
	})

	it.each(names)('should render "%s"', (name) => {
		const props = {
			value: null,
			...customProps[name]
		}

		// skipcq: JS-E1007
		const { container } = render(components[name], { props })
		expect(container).toMatchSnapshot()
	})

	it.each(names)('should render "%s" as disabled', (name) => {
		const props = $state({
			value: null,
			disabled: true,
			...customProps[name]
		})
		// skipcq: JS-E1007
		const { container } = render(components[name], { props })
		const element = container.querySelectorAll('input, textarea, select')[0]
		expect(element.disabled).toBe(true)

		props.disabled = false
		flushSync()
		expect(element.disabled).toBe(false)
	})

	it.each(names)('should render "%s" as required', (name) => {
		// skipcq: JS-E1007
		const props = $state({
			value: null,
			required: true,
			...customProps[name]
		})
		const { container } = render(components[name], { props })
		const element = container.querySelectorAll('input, textarea, select')[0]
		expect(element.required).toBe(true)

		props.required = false
		flushSync()
		expect(element.required).toBe(false)
	})

	it.each(names)('should handle events for %s', async (name) => {
		const props = $state({
			onfocus: vi.fn(),
			onblur: vi.fn(),
			onchange: vi.fn()
		})

		const { container } = render(components[name], { props })
		const element = container.querySelectorAll('input, textarea, select')[0]

		await fireEvent.focus(element)
		await tick()
		expect(props.onfocus).toHaveBeenCalledTimes(1)

		await fireEvent.blur(element)
		await tick()
		expect(props.onblur).toHaveBeenCalledTimes(1)

		await fireEvent.change(element)
		await tick()
		expect(props.onchange).toHaveBeenCalledTimes(1)
	})

	it.each(withProps)('should render "%s" with custom props', (name, values) => {
		const props = $state({ ...values })
		// skipcq: JS-E1007
		const { container } = render(components[name], { props })
		expect(container).toMatchSnapshot()
	})
})

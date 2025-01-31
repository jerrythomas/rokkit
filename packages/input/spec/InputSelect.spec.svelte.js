import { describe, expect, beforeEach, it } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import { userEvent } from '@testing-library/user-event'
import { flushSync, tick } from 'svelte'

import InputSelect from '../src/InputSelect.svelte'

describe('InputSelect', () => {
	beforeEach(() => cleanup())

	it('should render with string options', async () => {
		const props = $state({
			value: 'foo',
			options: ['foo', 'bar', 'baz'],
			onchange: vi.fn()
		})
		const { container } = render(InputSelect, { props })
		expect(container).toMatchSnapshot()

		const selectElement = container.querySelector('select')

		await userEvent.selectOptions(selectElement, '1')
		await tick()
		expect(props.value).toBe('bar')
		expect(props.onchange).toHaveBeenCalledWith('bar')

		await userEvent.selectOptions(selectElement, '2')
		await tick()
		expect(props.value).toBe('baz')
		expect(props.onchange).toHaveBeenCalledWith('baz')

		props.options = ['foo', 'bar', 'baz', 'qux']
		flushSync()
		expect(container).toMatchSnapshot()
	})

	it('should render with objects ', async () => {
		const props = $state({
			value: { text: 'bar' },
			options: [{ text: 'foo' }, { text: 'bar' }, { text: 'baz' }],
			onchange: vi.fn()
		})
		const { container } = render(InputSelect, { props })
		expect(container).toMatchSnapshot()
		const selectElement = container.querySelector('select')

		await userEvent.selectOptions(selectElement, '1')
		await tick()
		expect(props.value).toEqual({ text: 'bar' })
		expect(props.onchange).toHaveBeenCalledWith({ text: 'bar' })

		await userEvent.selectOptions(selectElement, '2')
		await tick()
		expect(props.value).toEqual({ text: 'baz' })
		expect(props.onchange).toHaveBeenCalledWith({ text: 'baz' })
	})

	it('should render with text, value objects ', async () => {
		const props = $state({
			value: 3,
			options: [
				{ value: 1, text: 'foo' },
				{ value: 2, text: 'bar' },
				{ value: 3, text: 'baz' }
			],
			onchange: vi.fn()
		})
		const { container } = render(InputSelect, { props })
		expect(container).toMatchSnapshot()
		const selectElement = container.querySelector('select')

		await userEvent.selectOptions(selectElement, '1')
		await tick()
		expect(props.value).toEqual(props.options[1])
		expect(props.onchange).toHaveBeenCalledWith(props.options[1])

		await userEvent.selectOptions(selectElement, '2')
		await tick()
		expect(props.value).toBe(props.options[2])
		expect(props.onchange).toHaveBeenCalledWith(props.options[2])
	})

	it('should render as disabled', () => {
		const props = $state({
			value: null,
			options: ['foo', 'bar', 'baz'],
			disabled: true
		})
		const { container } = render(InputSelect, { props })
		const element = container.querySelector('select')

		expect(element.disabled).toBe(true)

		props.disabled = false
		flushSync()
		expect(element.disabled).toBe(false)
	})

	it('should render as required', () => {
		const props = $state({
			value: null,
			options: ['foo', 'bar', 'baz'],
			required: true,
			rtl: true
		})
		const { container } = render(InputSelect, { props })
		expect(container).toMatchSnapshot()
		const element = container.querySelector('select')

		expect(element.required).toBeTruthy()

		props.required = false
		flushSync()
		expect(element.required).toBeFalsy()

		props.rtl = false
		flushSync()
		expect(container).toMatchSnapshot()
	})
})

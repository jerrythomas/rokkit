import { describe, expect, beforeEach, it, vi } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import { flushSync, tick } from 'svelte'

import InputRadio from '../src/InputRadio.svelte'

describe('InputRadio', () => {
	beforeEach(() => cleanup())

	it('should render with string options', async () => {
		const props = $state({
			value: 'foo',
			options: ['foo', 'bar', 'baz'],
			onchange: vi.fn()
		})
		const { container } = render(InputRadio, { props })
		expect(container).toMatchSnapshot()

		const elements = container.querySelectorAll('input[type="radio"]')
		expect(elements[0].checked).toBe(true)
		elements[1].click()
		await tick()
		expect(props.value).toBe('bar')
		expect(props.onchange).toHaveBeenCalledWith('bar')
	})

	it('should render with object array', async () => {
		const props = $state({
			value: { text: 'bar' },
			options: [{ text: 'foo' }, { text: 'bar' }, { text: 'baz' }],
			onchange: vi.fn()
		})
		const { container } = render(InputRadio, { props })
		expect(container).toMatchSnapshot()

		const elements = container.querySelectorAll('input[type="radio"]')
		expect(elements[1].checked).toBe(true)

		elements[2].click()
		await tick()
		expect(props.value).toEqual({ text: 'baz' })
		expect(props.onchange).toHaveBeenCalledWith({ text: 'baz' })
	})

	it('should render with text, value objects ', async () => {
		const props = $state({
			value: { value: 3, text: 'baz' },
			options: [
				{ value: 1, text: 'foo' },
				{ value: 2, text: 'bar' },
				{ value: 3, text: 'baz' }
			],
			onchange: vi.fn()
		})
		const { container } = render(InputRadio, { props })
		expect(container).toMatchSnapshot()
		const elements = container.querySelectorAll('input[type="radio"]')
		expect(elements[2].checked).toBe(true)

		elements[1].click()
		await tick()
		expect(props.value).toEqual({ value: 2, text: 'bar' })
		expect(props.onchange).toHaveBeenCalledWith({ value: 2, text: 'bar' })
	})

	it('should render as disabled', () => {
		const props = $state({
			value: null,
			options: ['foo', 'bar', 'baz'],
			disabled: true
		})
		const { container } = render(InputRadio, { props })
		const elements = container.querySelectorAll('input[type="radio"]')
		expect(elements.length).toBe(3)
		elements.forEach((element) => {
			expect(element.disabled).toBe(true)
		})

		props.disabled = false
		flushSync()
		elements.forEach((element) => {
			expect(element.disabled).toBe(false)
		})
	})

	it('should render as required', () => {
		const props = $state({
			value: null,
			options: ['foo', 'bar', 'baz'],
			required: true,
			name: 'radio-group',
			rtl: true
		})
		const { container } = render(InputRadio, { props })
		expect(container).toMatchSnapshot()
		const elements = container.querySelectorAll('input[type="radio"]')
		expect(elements.length).toBe(3)
		elements.forEach((element) => {
			expect(element.required).toBeTruthy()
		})

		props.required = false
		flushSync()
		elements.forEach((element) => {
			expect(element.required).toBeFalsy()
		})

		props.rtl = false
		flushSync()
		expect(container).toMatchSnapshot()
	})
})

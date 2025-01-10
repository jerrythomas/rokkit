import { describe, expect, beforeEach, it } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import { flushSync, tick } from 'svelte'

import InputRadio from '../src/InputRadio.svelte'

describe('InputRadio', () => {
	beforeEach(() => cleanup())

	it('should render with string options', async () => {
		const props = $state({
			value: 'foo',
			options: ['foo', 'bar', 'baz']
		})
		const { container } = render(InputRadio, { props })
		expect(container).toMatchSnapshot()

		const elements = container.querySelectorAll('input')
		expect(elements[0].checked).toBe(true)
		elements[1].click()
		await tick()
		expect(props.value).toBe('bar')

		props.rtl = true
		flushSync()
		expect(container).toMatchSnapshot()
	})

	it('should render with object array', async () => {
		const props = $state({
			value: 'bar',
			options: [{ text: 'foo' }, { text: 'bar' }, { text: 'baz' }]
		})
		const { container } = render(InputRadio, { props })
		expect(container).toMatchSnapshot()

		const elements = container.querySelectorAll('input')
		expect(elements[1].checked).toBe(true)

		elements[2].click()
		await tick()
		expect(props.value).toBe('baz')
	})

	it('should render with text, value objects ', async () => {
		const props = $state({
			value: 3,
			options: [
				{ value: 1, text: 'foo' },
				{ value: 2, text: 'bar' },
				{ value: 3, text: 'baz' }
			]
		})
		const { container } = render(InputRadio, { props })
		expect(container).toMatchSnapshot()
		const elements = container.querySelectorAll('input')
		expect(elements[2].checked).toBe(true)

		elements[1].click()
		await tick()
		expect(props.value).toBe(2)
	})

	it('should render as disabled', () => {
		const props = $state({
			value: null,
			disabled: true
		})
		const { container } = render(InputRadio, { props })
		const elements = container.querySelectorAll('input')

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
			required: true,
			rtl: true
		})
		const { container } = render(InputRadio, { props })
		const elements = container.querySelectorAll('input')

		elements.forEach((element) => {
			expect(element.required).toBe(true)
		})

		props.required = false
		flushSync()
		elements.forEach((element) => {
			expect(element.required).toBe(true)
		})

		props.rtl = false
		flushSync()
		expect(container).toMatchSnapshot()
	})
})

import { describe, expect, beforeEach, it } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import { userEvent } from '@testing-library/user-event'
import { flushSync, tick } from 'svelte'

import InputTextArea from '../../src/input/InputTextArea.svelte'

describe('InputTextArea', () => {
	beforeEach(() => cleanup())

	it('should render', () => {
		const props = $state({ value: '' })
		const { container } = render(InputTextArea, { props })

		const element = container.querySelector('textarea')
		expect(element.value).toBe('')

		props.value = 'hello'
		flushSync()
		expect(element.value).toBe('hello')
	})

	it('should render as disabled', () => {
		const props = $state({
			value: null,
			disabled: true
		})

		const { container } = render(InputTextArea, { props })
		const element = container.querySelector('textarea')
		expect(element.disabled).toBe(true)

		props.disabled = false
		flushSync()
		expect(element.disabled).toBe(false)
	})

	it('should render as required', () => {
		const props = $state({
			value: null,
			required: true
		})
		const { container } = render(InputTextArea, { props })
		const element = container.querySelector('textarea')
		expect(element.required).toBe(true)

		props.required = false
		flushSync()
		expect(element.required).toBe(false)
	})

	it('should handle input events', async () => {
		const props = $state({ value: '' })
		const { container } = render(InputTextArea, { props })

		const element = container.querySelector('textarea')
		await userEvent.type(element, 'hello')
		await tick()

		expect(props.value).toBe('hello')
	})

	it('should render with placeholder', () => {
		const props = $state({
			value: '',
			placeholder: 'Enter your message'
		})
		const { container } = render(InputTextArea, { props })
		const element = container.querySelector('textarea')
		expect(element.placeholder).toBe('Enter your message')
	})

	it('should render with rows and cols', () => {
		const props = $state({
			value: '',
			rows: 5,
			cols: 40
		})
		const { container } = render(InputTextArea, { props })
		const element = container.querySelector('textarea')
		expect(element.rows).toBe(5)
		expect(element.cols).toBe(40)
	})

	it('should render with maxlength and minlength', () => {
		const props = $state({
			value: '',
			maxlength: 200,
			minlength: 10
		})
		const { container } = render(InputTextArea, { props })
		const element = container.querySelector('textarea')
		expect(element.maxLength).toBe(200)
		expect(element.minLength).toBe(10)
	})

	it('should render as readonly', () => {
		const props = $state({
			value: 'readonly text',
			readonly: true
		})
		const { container } = render(InputTextArea, { props })
		const element = container.querySelector('textarea')
		expect(element.readOnly).toBe(true)

		props.readonly = false
		flushSync()
		expect(element.readOnly).toBe(false)
	})

	it('should render with wrap attribute', () => {
		const props = $state({
			value: '',
			wrap: 'hard'
		})
		const { container } = render(InputTextArea, { props })
		const element = container.querySelector('textarea')
		expect(element.wrap).toBe('hard')
	})
})

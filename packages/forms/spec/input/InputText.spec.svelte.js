import { describe, expect, beforeEach, it } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import { userEvent } from '@testing-library/user-event'
import { flushSync, tick } from 'svelte'

import InputText from '../../src/input/InputText.svelte'

describe('InputText', () => {
	beforeEach(() => cleanup())

	it('should render', () => {
		const props = $state({ value: '' })
		const { container } = render(InputText, { props })

		const element = container.querySelector('input')
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

		const { container } = render(InputText, { props })
		const element = container.querySelector('input')
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
		const { container } = render(InputText, { props })
		expect(container).toMatchSnapshot()
		const element = container.querySelector('input')
		expect(element.required).toBe(true)

		props.required = false
		flushSync()
		expect(element.required).toBe(false)
	})
	it('should render with additional attributes', () => {
		const props = $state({
			value: 'hello',
			id: 'foo',
			name: 'bar'
		})
		const { container } = render(InputText, { props })
		expect(container).toMatchSnapshot()
	})

	it('should handle input events', async () => {
		const props = $state({ value: '' })
		const { container } = render(InputText, { props })

		const element = container.querySelector('input')
		await userEvent.type(element, 'hello')
		await tick()

		expect(props.value).toBe('hello')
	})

	it('should render with placeholder', () => {
		const props = $state({
			value: '',
			placeholder: 'Enter your name'
		})
		const { container } = render(InputText, { props })
		const element = container.querySelector('input')
		expect(element.placeholder).toBe('Enter your name')
	})

	it('should render with maxlength and minlength', () => {
		const props = $state({
			value: '',
			maxlength: 50,
			minlength: 3
		})
		const { container } = render(InputText, { props })
		const element = container.querySelector('input')
		expect(element.maxLength).toBe(50)
		expect(element.minLength).toBe(3)
	})

	it('should render with pattern attribute', () => {
		const props = $state({
			value: '',
			pattern: '[A-Za-z]{3}'
		})
		const { container } = render(InputText, { props })
		const element = container.querySelector('input')
		expect(element.pattern).toBe('[A-Za-z]{3}')
	})

	it('should render as readonly', () => {
		const props = $state({
			value: 'readonly text',
			readonly: true
		})
		const { container } = render(InputText, { props })
		const element = container.querySelector('input')
		expect(element.readOnly).toBe(true)

		props.readonly = false
		flushSync()
		expect(element.readOnly).toBe(false)
	})

	it('should render with autocomplete', () => {
		const props = $state({
			value: '',
			autocomplete: 'name'
		})
		const { container } = render(InputText, { props })
		const element = container.querySelector('input')
		expect(element.autocomplete).toBe('name')
	})

	it('should render with size attribute', () => {
		const props = $state({
			value: '',
			size: 20
		})
		const { container } = render(InputText, { props })
		const element = container.querySelector('input')
		expect(element.size).toBe(20)
	})
})

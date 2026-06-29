import { describe, expect, beforeEach, it, vi } from 'vitest'
import { cleanup, render, fireEvent } from '@testing-library/svelte'
import { flushSync } from 'svelte'

import Input from '../../src/lib/Input.svelte'

describe('lib/Input', () => {
	beforeEach(() => cleanup())

	// ---------- Basic rendering ----------

	it('should render a standard text input with label', () => {
		const props = $state({ label: 'Name', value: 'Alice' })
		const { container } = render(Input, { props })

		expect(container.querySelector('input[type="text"]')).toBeTruthy()
		expect(container.querySelector('.input-label').textContent).toBe('Name')
		expect(container.querySelector('input').value).toBe('Alice')
	})

	it('should not render label when label is empty', () => {
		const props = $state({ label: '', value: '' })
		const { container } = render(Input, { props })

		expect(container.querySelector('.input-label')).toBeNull()
	})

	it('should apply standard layout class for text type', () => {
		const props = $state({ type: 'text', value: '' })
		const { container } = render(Input, { props })

		expect(container.querySelector('.input-layout-standard')).toBeTruthy()
	})

	it('should apply checkbox layout class for checkbox type', () => {
		const props = $state({ type: 'checkbox', value: false, label: 'Accept' })
		const { container } = render(Input, { props })

		expect(container.querySelector('.input-layout-checkbox')).toBeTruthy()
	})

	it('should apply radio layout class for radio type', () => {
		const props = $state({ type: 'radio', value: false, label: 'Option A' })
		const { container } = render(Input, { props })

		expect(container.querySelector('.input-layout-radio')).toBeTruthy()
	})

	// ---------- Checkbox / Radio branch ----------

	it('should render checkbox with checked state', () => {
		const props = $state({ type: 'checkbox', value: true })
		const { container } = render(Input, { props })

		const cb = container.querySelector('input[type="checkbox"]')
		expect(cb).toBeTruthy()
		expect(cb.checked).toBe(true)
	})

	it('should render checkbox label on the right side', () => {
		const props = $state({ type: 'checkbox', value: false, label: 'Agree' })
		const { container } = render(Input, { props })

		const label = container.querySelector('label.input-label')
		expect(label?.textContent).toBe('Agree')
	})

	it('should not render label for checkbox when label is empty', () => {
		const props = $state({ type: 'checkbox', value: false })
		const { container } = render(Input, { props })

		expect(container.querySelector('.input-label')).toBeNull()
	})

	// ---------- Select ----------

	it('should render a select element for type select', () => {
		const props = $state({
			type: 'select',
			value: 'b',
			options: ['a', 'b', 'c']
		})
		const { container } = render(Input, { props })

		const sel = container.querySelector('select')
		expect(sel).toBeTruthy()
		expect(sel.querySelectorAll('option')).toHaveLength(3)
	})

	it('should render select with object options', () => {
		const props = $state({
			type: 'select',
			value: 2,
			options: [
				{ value: 1, label: 'One' },
				{ value: 2, label: 'Two' }
			]
		})
		const { container } = render(Input, { props })

		const options = container.querySelectorAll('option')
		expect(options).toHaveLength(2)
		expect(options[0].textContent).toBe('One')
		expect(options[1].textContent).toBe('Two')
	})

	it('should render object options without label using value as text', () => {
		const props = $state({
			type: 'select',
			value: 1,
			options: [{ value: 1 }]
		})
		const { container } = render(Input, { props })

		const option = container.querySelector('option')
		// label is undefined so option.value is used as text
		expect(option.textContent).toBeTruthy()
	})

	// ---------- Textarea ----------

	it('should render a textarea for type textarea', () => {
		const props = $state({ type: 'textarea', value: 'hello' })
		const { container } = render(Input, { props })

		const ta = container.querySelector('textarea')
		expect(ta).toBeTruthy()
		expect(ta.value).toBe('hello')
	})

	// ---------- Attributes ----------

	it('should forward placeholder, required, disabled, readonly', () => {
		const props = $state({
			type: 'text',
			value: '',
			placeholder: 'Type here',
			required: true,
			disabled: true,
			readonly: true
		})
		const { container } = render(Input, { props })

		const el = container.querySelector('input')
		expect(el.placeholder).toBe('Type here')
		expect(el.required).toBe(true)
		expect(el.disabled).toBe(true)
		expect(el.readOnly).toBe(true)
	})

	it('should forward min, max, step, pattern, minLength, maxLength', () => {
		const props = $state({
			type: 'number',
			value: 5,
			min: 1,
			max: 10,
			step: 0.5,
			pattern: '[0-9]+',
			minLength: 1,
			maxLength: 3
		})
		const { container } = render(Input, { props })

		const el = container.querySelector('input')
		expect(el.min).toBe('1')
		expect(el.max).toBe('10')
		expect(el.step).toBe('0.5')
		expect(el.pattern).toBe('[0-9]+')
	})

	// ---------- Description and message ----------

	it('should render description text', () => {
		const props = $state({ value: '', description: 'Helpful hint' })
		const { container } = render(Input, { props })

		const desc = container.querySelector('.input-description')
		expect(desc?.textContent).toBe('Helpful hint')
	})

	it('should not render description element when empty', () => {
		const props = $state({ value: '' })
		const { container } = render(Input, { props })

		expect(container.querySelector('.input-description')).toBeNull()
	})

	it('should render error message', () => {
		const props = $state({
			value: '',
			message: { state: 'error', text: 'Required field' }
		})
		const { container } = render(Input, { props })

		const msg = container.querySelector('.input-message')
		expect(msg?.textContent).toBe('Required field')
		expect(msg?.classList.contains('message-error')).toBe(true)
		expect(container.querySelector('.has-error')).toBeTruthy()
	})

	it('should render warning message', () => {
		const props = $state({
			value: '',
			message: { state: 'warning', text: 'Check this' }
		})
		const { container } = render(Input, { props })

		const msg = container.querySelector('.input-message')
		expect(msg?.classList.contains('message-warning')).toBe(true)
	})

	it('should render info message', () => {
		const props = $state({
			value: '',
			message: { state: 'info', text: 'FYI' }
		})
		const { container } = render(Input, { props })

		const msg = container.querySelector('.input-message')
		expect(msg?.classList.contains('message-info')).toBe(true)
	})

	it('should render success message', () => {
		const props = $state({
			value: '',
			message: { state: 'success', text: 'Good!' }
		})
		const { container } = render(Input, { props })

		const msg = container.querySelector('.input-message')
		expect(msg?.classList.contains('message-success')).toBe(true)
	})

	it('should not render message element when null', () => {
		const props = $state({ value: '', message: null })
		const { container } = render(Input, { props })

		expect(container.querySelector('.input-message')).toBeNull()
		expect(container.querySelector('.has-error')).toBeNull()
	})

	// ---------- Event handlers ----------

	it('should call onchange with the new text value', () => {
		const onchange = vi.fn()
		const props = $state({ type: 'text', value: '', onchange })
		const { container } = render(Input, { props })

		const el = container.querySelector('input')
		el.value = 'hello'
		fireEvent.change(el)

		expect(onchange).toHaveBeenCalledWith('hello')
		expect(props.value).toBe('hello')
	})

	it('should call onchange with boolean true for checked checkbox', () => {
		const onchange = vi.fn()
		const props = $state({ type: 'checkbox', value: false, onchange })
		const { container } = render(Input, { props })

		const el = container.querySelector('input[type="checkbox"]')
		el.checked = true
		fireEvent.change(el)

		expect(onchange).toHaveBeenCalledWith(true)
		expect(props.value).toBe(true)
	})

	it('should call onchange with number for number type', () => {
		const onchange = vi.fn()
		const props = $state({ type: 'number', value: 0, onchange })
		const { container } = render(Input, { props })

		const el = container.querySelector('input[type="number"]')
		el.value = '42'
		fireEvent.change(el)

		expect(onchange).toHaveBeenCalledWith(42)
	})

	it('should not crash when onchange is not provided', () => {
		const props = $state({ type: 'text', value: '' })
		const { container } = render(Input, { props })

		const el = container.querySelector('input')
		el.value = 'hello'
		expect(() => fireEvent.change(el)).not.toThrow()
	})

	it('should set aria-describedby when description is provided', () => {
		const props = $state({ value: '', description: 'A description' })
		const { container } = render(Input, { props })

		const el = container.querySelector('input')
		expect(el.getAttribute('aria-describedby')).toBeTruthy()
	})

	it('should set aria-describedby when message is provided', () => {
		const props = $state({
			value: '',
			message: { state: 'error', text: 'Error!' }
		})
		const { container } = render(Input, { props })

		const el = container.querySelector('input')
		expect(el.getAttribute('aria-describedby')).toBeTruthy()
	})

	it('should not set aria-describedby when neither description nor message', () => {
		const props = $state({ value: '' })
		const { container } = render(Input, { props })

		const el = container.querySelector('input')
		expect(el.getAttribute('aria-describedby')).toBeNull()
	})

	it('should call onfocus and onblur handlers', async () => {
		const onfocus = vi.fn()
		const onblur = vi.fn()
		const props = $state({ value: '', onfocus, onblur })
		const { container } = render(Input, { props })

		const el = container.querySelector('input')
		fireEvent.focus(el)
		expect(onfocus).toHaveBeenCalledTimes(1)

		fireEvent.blur(el)
		expect(onblur).toHaveBeenCalledTimes(1)
	})

	it('should update UI reactively when value changes', () => {
		const props = $state({ type: 'text', value: 'initial' })
		const { container } = render(Input, { props })

		const el = container.querySelector('input')
		expect(el.value).toBe('initial')

		props.value = 'updated'
		flushSync()
		expect(el.value).toBe('updated')
	})

	it('should apply className to wrapper', () => {
		const props = $state({ value: '', className: 'my-custom-class' })
		const { container } = render(Input, { props })

		expect(container.querySelector('.my-custom-class')).toBeTruthy()
	})
})

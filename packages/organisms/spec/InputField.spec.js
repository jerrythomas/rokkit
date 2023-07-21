import { describe, expect, it, beforeEach } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import { tick } from 'svelte'
import InputField from '../src/InputField.svelte'

describe('InputField.svelte', () => {
	beforeEach(() => cleanup())

	it('should render default', async () => {
		const { container, component } = render(InputField, { name: 'name' })
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()

		let input = container.querySelector('input')
		expect(input).toBeTruthy()
		expect(input.value).toBe('')

		// handle value change
		component.$set({ value: 'hello' })
		await tick()
		input = container.querySelector('input')
		expect(input).toBeTruthy()
		expect(input.value).toBe('hello')
	})

	it('should render null', () => {
		const { container } = render(InputField, { value: null, name: 'name' })
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})

	it('should render with value', () => {
		const { container } = render(InputField, {
			value: 'John',
			name: 'FirstName'
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})

	it('should render with label and value', async () => {
		const { container, component } = render(InputField, {
			label: 'text',
			value: 'text',
			name: 'name'
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
		// handle change
		component.$set({ label: 'other' })
		await tick()
		expect(container).toMatchSnapshot()
	})

	it.each(['pass', 'fail', 'warn'])(
		'should render with label, value and status=%s',
		(status) => {
			const { container } = render(InputField, {
				label: 'text',
				value: 'text',
				status,
				message: 'error',
				name: 'name'
			})
			expect(container).toBeTruthy()
			expect(container).toMatchSnapshot()
		}
	)

	it('should render with description', () => {
		const { container } = render(InputField, {
			label: 'text',
			value: 'text',
			name: 'name',
			description: 'description'
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})

	it('should render when disabled', async () => {
		const { container, component } = render(InputField, {
			label: 'text',
			value: 'text',
			name: 'name',
			disabled: true
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()

		component.$set({ disabled: false })
		await tick()
		expect(container).toMatchSnapshot()
	})

	it('should render with custom class an type', async () => {
		const { container, component } = render(InputField, {
			name: 'name',
			type: 'number',
			class: 'custom'
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()

		component.$set({ class: 'other' })
		await tick()
		let wrapper = container.querySelector('input-field')
		expect(wrapper).toBeTruthy()
		expect(Array.from(wrapper.classList)).toContain('other')
		expect(Array.from(wrapper.classList)).toContain('input-number')
	})

	it('should render with icon', async () => {
		const { container, component } = render(InputField, {
			name: 'name',
			icon: 'icon'
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()

		component.$set({ icon: 'other' })
		await tick()
		let icon = container.querySelector('i')
		expect(icon).toBeTruthy()
		expect(Array.from(icon.classList)).toContain('other')
	})
})

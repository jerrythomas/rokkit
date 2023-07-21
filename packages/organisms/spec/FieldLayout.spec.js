import { describe, expect, it, beforeEach } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import { tick } from 'svelte'
import Register from './mocks/Register.svelte'
import CustomField from './mocks/CustomField.svelte'
import CustomWrapper from './mocks/CustomWrapper.svelte'

import FieldLayout from '../src/FieldLayout.svelte'

describe('FieldLayout.svelte', () => {
	beforeEach(() => cleanup())

	const inputAgeSchema = {
		component: 'input',
		key: 'age',
		props: { type: 'number', label: 'Age', min: 0, max: 100 }
	}
	const inputNameSchema = {
		component: 'input',
		key: 'name',
		props: { type: 'text', label: 'Name' }
	}
	const splitNameSchema = [
		{
			component: 'input',
			key: 'first',
			props: { type: 'text', label: 'First Name' }
		},
		{
			component: 'input',
			key: 'last',
			props: { type: 'text', label: 'Last Name' }
		}
	]
	const customFieldSchema = {
		component: 'custom',
		key: 'title'
	}
	beforeEach(() => cleanup())

	it('should render error when elements is missing', () => {
		const { container } = render(Register, { render: FieldLayout })
		expect(container).toBeTruthy()
		const error = container.querySelector('error')
		expect(error).toBeTruthy()
		expect(error).toMatchSnapshot()
	})

	it('should render error when elements is not an array', () => {
		const { container } = render(Register, {
			render: FieldLayout,
			properties: { schema: { elements: 'not an array' } }
		})
		expect(container).toBeTruthy()
		const error = container.querySelector('error')
		expect(error).toBeTruthy()
		expect(error).toMatchSnapshot()
	})

	it('should render set of inputs', () => {
		const schema = { elements: [inputNameSchema, inputAgeSchema] }
		let value = { name: 'John', age: 30 }
		const { container } = render(Register, {
			render: FieldLayout,
			properties: { value, schema }
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})

	it('should render groups', async () => {
		const schema = {
			elements: [
				{
					key: 'name',
					type: 'horizontal',
					elements: splitNameSchema
				},
				inputAgeSchema
			]
		}
		let value = { name: { first: 'John', last: 'Smith' }, age: 30 }
		const { container, component } = render(Register, {
			render: FieldLayout,
			properties: { value, schema }
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()

		component.$$set({
			value: { name: { first: 'Jane', last: 'Doe' }, age: 50 }
		})
		await tick()
		expect(container).toMatchSnapshot()
	})

	it('should render groups without key', async () => {
		const schema = {
			elements: [
				{
					type: 'horizontal',
					elements: splitNameSchema
				},
				inputAgeSchema
			]
		}
		let value = { first: 'John', last: 'Smith', age: 30 }
		const { container, component } = render(Register, {
			render: FieldLayout,
			properties: { value, schema }
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()

		component.$$set({ value: { first: 'Jane', last: 'Doe', age: 50 } })
		await tick()
		expect(container).toMatchSnapshot()
	})

	it('should render groups with custom wrapper', async () => {
		let schema = {
			elements: [
				{
					title: 'A Group',
					key: 'name',
					type: 'horizontal',
					wrapper: 'mock',
					elements: splitNameSchema
				},
				inputAgeSchema
			]
		}
		let value = { name: { first: 'John', last: 'Smith' }, age: 30 }
		const { container, component } = render(Register, {
			render: FieldLayout,
			components: { mock: CustomWrapper },
			properties: { value, schema }
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
		schema.elements[0].title = null
		component.$$set({ schema })
		await tick()
		expect(container).toMatchSnapshot()
	})

	it('should render items using custom component', () => {
		const schema = { elements: [inputNameSchema, customFieldSchema] }
		let value = { name: 'John', title: 'Mr.' }
		const { container } = render(Register, {
			render: FieldLayout,
			components: { custom: CustomField },
			properties: { value, schema }
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})

	it('should render items using custom component', () => {})
	it('should expand and collapse', () => {})
	it('should autoclose others', () => {})
	it('should pass select and change events', () => {})
})

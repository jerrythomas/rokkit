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
		key: 'age',
		props: { type: 'number', label: 'Age', min: 0, max: 100 }
	}
	const inputNameSchema = {
		key: 'name',
		props: { type: 'text', label: 'Name' }
	}
	const splitNameSchema = [
		{
			key: 'first',
			props: { type: 'text', label: 'First Name' }
		},
		{
			key: 'last',
			props: { type: 'text', label: 'Last Name' }
		}
	]

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
		const value = { name: 'John', age: 30 }
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
		const value = { name: { first: 'John', last: 'Smith' }, age: 30 }
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
		const value = { first: 'John', last: 'Smith', age: 30 }
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
		const schema = {
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
		const value = { name: { first: 'John', last: 'Smith' }, age: 30 }
		const { container, component } = render(Register, {
			render: FieldLayout,
			using: { wrappers: { mock: CustomWrapper } },
			properties: { value, schema }
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
		schema.elements[0].title = null
		component.$$set({ schema })
		await tick()
		expect(container).toMatchSnapshot()
	})

	it('should render items using custom component', async () => {
		const schema = {
			elements: [
				{
					component: 'custom',
					using: { components: { custom: CustomField } },
					props: { label: 'The name', type: 'string', name: 'alias' }
				}
			]
		}
		const value = { name: 'John' }
		const { container, component } = render(Register, {
			render: FieldLayout,
			properties: { value, schema }
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()

		// handle schema change
		delete schema.elements[0].key
		component.$set({ properties: { value, schema } })
		await tick()
		expect(container).toMatchSnapshot()
	})
	it('should render items using default component', () => {
		let schema = {
			elements: [
				{
					component: 'custom'
				}
			]
		}
		const value = { name: 'John' }
		const { container } = render(Register, {
			render: FieldLayout,
			properties: { value, schema }
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
})

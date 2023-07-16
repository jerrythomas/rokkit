import { describe, expect, it, beforeEach } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import CustomField from './mocks/CustomField.svelte'
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

	it('should render set of inputs', () => {
		const schema = [inputNameSchema, inputAgeSchema]
		let value = { name: 'John', age: 30 }
		const { container } = render(FieldLayout, { value, schema })
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})

	it('should render groups', () => {
		const schema = {
			elements: [
				{
					group: true,
					label: 'A Group',
					key: 'name',
					props: {
						class: 'flex-row',
						schema: { type: 'horizontal', elements: splitNameSchema }
					}
				},
				inputAgeSchema
			]
		}
		let value = { name: { first: 'John', last: 'Smith' }, age: 30 }
		const { container } = render(FieldLayout, { value, schema })
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
	it('should render items using custom component', () => {
		const schema = { elements: [inputNameSchema, customFieldSchema] }
		let value = { name: 'John', title: 'Mr.' }
		const { container } = render(FieldLayout, {
			value,
			schema,
			using: { custom: CustomField }
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
	it('should render using field mappings', () => {})
	it('should render items using custom component', () => {})
	it('should expand and collapse', () => {})
	it('should autoclose others', () => {})
	it('should pass select and change events', () => {})
})

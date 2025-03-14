import { describe, expect, it, beforeEach } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import Form from '../src/Form.svelte'
import layout from './lib/fixtures/input-layout.json'
import schema from './lib/fixtures/input-schema.json'
import CustomField from './mocks/CustomField.svelte'

describe('Form.svelte', () => {
	const value = {
		name: 'John',
		age: 30,
		address: {
			street: '123 Main St',
			city: 'New York',
			state: 'NY',
			zip: 10001
		}
	}

	beforeEach(() => cleanup())

	it('should render a form', () => {
		const props = $state({ value })
		const { container } = render(Form, { props })
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})

	it('should render a form with schema', () => {
		const { container } = render(Form, { props: { value, schema } })
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})

	it('should render a form with layout', () => {
		const { container } = render(Form, {
			props: {
				value,
				layout,
				using: { components: { custom: CustomField } }
			}
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})

	it('should render a form with schema & layout', () => {
		const { container } = render(Form, {
			props: {
				value,
				schema,
				layout,
				using: { components: { custom: CustomField } }
			}
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
})

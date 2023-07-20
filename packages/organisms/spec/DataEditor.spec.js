import { describe, expect, it, beforeEach } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import DataEditor from '../src/DataEditor.svelte'
import layout from './lib/fixtures/input-layout.json'
import schema from './lib/fixtures/input-schema.json'
import CustomField from './mocks/CustomField.svelte'

describe('DataEditor.svelte', () => {
	let value = {
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

	it('should render an object editor', () => {
		const { container } = render(DataEditor, { value })
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})

	it('should render an object editor using schema', () => {
		const { container } = render(DataEditor, { value, schema })
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})

	it('should render an object editor using layout', () => {
		const { container } = render(DataEditor, {
			value,
			layout,
			using: { custom: CustomField }
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})

	it('should render an object editor using schema & layout', () => {
		const { container } = render(DataEditor, {
			value,
			schema,
			layout,
			using: { custom: CustomField }
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
})

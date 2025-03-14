import { describe, expect, it, beforeEach } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import { flushSync, tick } from 'svelte'
import DataEditor from '../src/DataEditor.svelte'
import layout from './lib/fixtures/input-layout.json'
import schema from './lib/fixtures/input-schema.json'
import CustomField from './mocks/CustomField.svelte'

describe('DataEditor.svelte', () => {
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

	it('should render an object editor', () => {
		const props = $state({ value })
		const { container } = render(DataEditor, { props })
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})

	it('should render an object editor using schema', () => {
		const props = $state({ value, schema })
		const { container } = render(DataEditor, { props })
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})

	it('should render an object editor using layout', () => {
		const props = $state({
			value,
			layout,
			using: { components: { custom: CustomField } }
		})
		const { container } = render(DataEditor, { props })
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})

	it('should render an object editor using schema & layout', () => {
		const props = $state({
			value,
			schema,
			layout,
			using: { components: { custom: CustomField } }
		})
		const { container } = render(DataEditor, { props })
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})

	it('should handle changes', async () => {
		const props = $state({ value, using: { components: { custom: CustomField } } })
		const { container } = render(DataEditor, { props })
		expect(container).toBeTruthy()
		props.schema = schema
		flushSync()
		await tick()
		expect(container).toMatchSnapshot()
		props.layout = layout
		flushSync()
		await tick()
		expect(container).toMatchSnapshot()
	})
})

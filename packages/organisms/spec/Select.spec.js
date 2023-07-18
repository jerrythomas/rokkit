import { describe, expect, it, beforeEach } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import Custom from './mocks/Custom.svelte'

import Select from '../src/Select.svelte'

describe('Select.svelte', () => {
	beforeEach(() => cleanup())

	it('should render using default field mapping', () => {
		const { container } = render(Select, { items: ['a', 'b', 'c'] })
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
	it('should render items using field mappings', () => {
		const { container } = render(Select, {
			items: [{ text: 1 }, { text: 2 }, { text: 3 }]
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
	it('should render items using custom mapping', () => {
		const { container } = render(Select, {
			items: [{ num: 1 }, { num: 2 }, { num: 3 }],
			fields: { text: 'num' }
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
	it('should render items using default item when data is invalid', () => {
		const { container } = render(Select, {
			items: [{ num: 1 }, { num: 2 }, { num: 3 }],
			fields: { text: 'num', component: 'num' }
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})

	it('should render with alternate class', () => {
		const { container } = render(Select, {
			items: [{ num: 1 }, { num: 2 }, { num: 3 }],
			fields: { text: 'num' },
			class: 'myClass'
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
	it('should render items using custom component', () => {
		const { container } = render(Select, {
			items: [{ num: 1, component: 'custom' }, { num: 2 }, { num: 3 }],
			fields: { text: 'num' },
			using: { custom: Custom }
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
})

import { describe, expect, it, beforeEach } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import Radio from '../../src/input/Radio.svelte'

describe('Radio.svelte', () => {
	beforeEach(() => cleanup())

	it('should render using string array', () => {
		const { container } = render(Radio, {
			name: 'radio',
			value: 'Alpha',
			options: ['Alpha', 'Beta', 'Gamma']
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})

	it('should render using object', () => {
		const { container } = render(Radio, {
			name: 'radio',
			value: 'alpha',
			options: [
				{ value: 'alpha', text: 'Alpha' },
				{ value: 'beta', text: 'Beta' },
				{ value: 'charlie', text: 'Charlie' }
			],
			textAfter: false
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
	it('should render with field mapping', () => {
		const { container } = render(Radio, {
			name: 'radio',
			value: 'alpha',
			options: [
				{ key: 'alpha', label: 'Alpha' },
				{ key: 'beta', label: 'Beta' },
				{ key: 'charlie', label: 'Charlie' }
			],
			fields: { value: 'key', text: 'label' },
			textAfter: false
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
})

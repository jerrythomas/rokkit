import { describe, expect, it, beforeEach } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import RadioGroup from '../../src/input/RadioGroup.svelte'

describe('RadioGroup.svelte', () => {
	beforeEach(() => cleanup())

	it('should render using string array', () => {
		const { container } = render(RadioGroup, {
			name: 'radio',
			value: 'Alpha',
			options: ['Alpha', 'Beta', 'Gamma']
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})

	it('should render using object', () => {
		const { container } = render(RadioGroup, {
			name: 'radio',
			value: 'alpha',
			options: [
				{ id: 'alpha', text: 'Alpha' },
				{ id: 'beta', text: 'Beta' },
				{ id: 'charlie', text: 'Charlie' }
			],
			textAfter: false
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
	it('should render with field mapping', () => {
		const { container } = render(RadioGroup, {
			name: 'radio',
			value: 'alpha',
			options: [
				{ value: 'alpha', label: 'Alpha' },
				{ value: 'beta', label: 'Beta' },
				{ value: 'charlie', label: 'Charlie' }
			],
			fields: { id: 'value', text: 'label' },
			textAfter: false
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
})

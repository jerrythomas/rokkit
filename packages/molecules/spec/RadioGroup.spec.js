import { describe, expect, it, beforeEach } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import RadioGroup from '../src/RadioGroup.svelte'

describe('RadioGroup.svelte', () => {
	beforeEach(() => cleanup())

	it('should render default', () => {
		const { container } = render(RadioGroup, {
			name: 'radio',
			value: 'a',
			items: [
				{ value: 'b', label: 'b' },
				{ value: 'a', label: 'a' }
			]
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})

	it('should render with alternative class', () => {
		const { container } = render(RadioGroup, {
			name: 'radio',
			value: 'a',
			items: [
				{ value: 'b', label: 'b' },
				{ value: 'a', label: 'a' }
			],
			textAfter: false
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
})

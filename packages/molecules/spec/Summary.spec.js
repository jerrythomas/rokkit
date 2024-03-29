import { describe, expect, it, beforeEach } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import Summary from '../src/Summary.svelte'

describe('Summary.svelte', () => {
	beforeEach(() => cleanup())
	it('should render summary text', () => {
		const { container } = render(Summary, { value: 'Content for A' })
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})

	it('should render summary with collapsed icon', () => {
		const { container } = render(Summary, {
			value: { text: 'Content for Collapses', children: ['Alpha', 'Beta'] }
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
	it('should render summary with expanded icon', () => {
		const { container } = render(Summary, {
			value: {
				text: 'Content for Expanded',
				children: ['Alpha', 'Beta'],
				_open: true
			}
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
})

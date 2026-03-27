import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import CrossFilter from '../../src/crossfilter/CrossFilter.svelte'
import TestCrossFilter from '../helpers/TestCrossFilter.svelte'

describe('CrossFilter', () => {
	it('renders without crashing', () => {
		expect(() => render(CrossFilter)).not.toThrow()
	})

	it('renders data-crossfilter container', () => {
		const { container } = render(CrossFilter)
		expect(container.querySelector('[data-crossfilter]')).toBeTruthy()
	})

	it('data-crossfilter-mode attribute reflects mode prop', () => {
		const { container } = render(CrossFilter, { props: { mode: 'hide' } })
		expect(container.querySelector('[data-crossfilter-mode="hide"]')).toBeTruthy()
	})

	it("'crossfilter-mode' context defaults to 'dim'", () => {
		const { container } = render(TestCrossFilter)
		const child = container.querySelector('[data-testid="mode-output"]')
		expect(child).toBeTruthy()
		expect(child.getAttribute('data-mode')).toBe('dim')
	})
})

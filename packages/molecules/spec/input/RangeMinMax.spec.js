import { beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render } from '@testing-library/svelte'
import RangeMinMax from '../../src/input/RangeMinMax.svelte'

describe('RangeMinMax.svelte', () => {
	beforeEach(() => cleanup())
	it('should render', () => {
		const { container } = render(RangeMinMax, {
			name: 'range'
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
	it('should render with min, max', () => {
		const { container } = render(RangeMinMax, {
			name: 'range',
			min: 20,
			max: 40
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
	it('should render with ticks', () => {
		const { container } = render(RangeMinMax, {
			name: 'range',
			ticks: 5
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
})

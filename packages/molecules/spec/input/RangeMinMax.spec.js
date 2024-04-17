import { beforeEach, describe, expect, it } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import { tick } from 'svelte'
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

	it('should render with value', () => {
		const { container } = render(RangeMinMax, {
			name: 'range',
			value: [30, 40]
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})

	it('should handle class changes', async () => {
		const { container, component } = render(RangeMinMax, {
			name: 'range',
			class: 'test'
		})
		expect(container).toMatchSnapshot()
		let range = container.querySelector('input-range')
		expect(Array.from(range.classList)).toContain('test')
		component.$set({ class: 'test2' })
		await tick()
		expect(container).toMatchSnapshot()
		expect(Array.from(range.classList)).toContain('test2')
	})

	it('should display error when value is not an array', () => {
		const { container } = render(RangeMinMax, {
			name: 'range',
			value: 30
		})
		expect(container).toMatchSnapshot()
	})

	it('should handle value changes', async () => {
		const { container, component } = render(RangeMinMax, {
			name: 'range',
			value: [30, 40]
		})
		expect(container).toMatchSnapshot()
		component.$set({ value: [20, 30] })
		await tick()
		expect(container).toMatchSnapshot()
	})

	describe('singgle value', () => {
		it('should work using single mode', () => {
			const { container } = render(RangeMinMax, {
				name: 'range',
				single: true
			})
			expect(container).toMatchSnapshot()
			// let range = container.querySelector('input-range')
			// expect(range.getAttribute('single')).toBe('true')
			// component.$set({ single: false })
			// await tick()
			// expect(range.getAttribute('single')).toBe('false')
		})
		it('should handle value changes', async () => {
			const { container, component } = render(RangeMinMax, {
				name: 'range',
				value: [30]
			})
			expect(container).toMatchSnapshot()
			component.$set({ value: [20] })
			await tick()
			expect(container).toMatchSnapshot()
		})
	})
})

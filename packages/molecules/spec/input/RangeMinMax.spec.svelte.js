import { beforeEach, describe, expect, it } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import { tick } from 'svelte'
import RangeMinMax from '../../src/input/RangeMinMax.svelte'

describe('RangeMinMax.svelte', () => {
	beforeEach(() => cleanup())
	it('should render', () => {
		const { container } = render(RangeMinMax, {
			props: {
				name: 'range'
			}
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
	it('should render with min, max', () => {
		const { container } = render(RangeMinMax, {
			props: {
				name: 'range',
				min: 20,
				max: 40
			}
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
	it('should render with ticks', () => {
		const { container } = render(RangeMinMax, {
			props: {
				name: 'range',
				ticks: 5
			}
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})

	it('should render with value', () => {
		const { container } = render(RangeMinMax, {
			props: {
				name: 'range',
				value: [30, 40]
			}
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})

	it('should handle class changes', async () => {
		const props = $state({
			name: 'range',
			class: 'test'
		})
		const { container } = render(RangeMinMax, { props })
		expect(container).toMatchSnapshot()
		const range = container.querySelector('input-range')
		expect(Array.from(range.classList)).toContain('test')

		props.class = 'test2'
		await tick()
		expect(container).toMatchSnapshot()
		expect(Array.from(range.classList)).toContain('test2')
	})

	it('should display error when value is not an array', () => {
		const { container } = render(RangeMinMax, {
			props: {
				name: 'range',
				value: 30
			}
		})
		expect(container).toMatchSnapshot()
	})

	it('should handle value changes', async () => {
		const props = $state({
			name: 'range',
			value: [30, 40]
		})
		const { container } = render(RangeMinMax, { props })
		expect(container).toMatchSnapshot()
		props.value = [20, 30]
		await tick()
		expect(container).toMatchSnapshot()
	})

	describe('single value', () => {
		it('should work using single mode', async () => {
			const props = $state({
				name: 'range',
				single: true
			})
			const { container } = render(RangeMinMax, { props })
			expect(container).toMatchSnapshot()
			const range = container.querySelector('input-range')
			expect(range.querySelectorAll('thumb').length).toEqual(1)
			props.single = false
			await tick()
			expect(range.querySelectorAll('thumb').length).toEqual(2)
		})
		it('should handle value changes', async () => {
			const props = $state({
				name: 'range',
				value: [30]
			})
			const { container, component } = render(RangeMinMax, { props })
			expect(container).toMatchSnapshot()
			props.value = [20]
			await tick()
			expect(container).toMatchSnapshot()
		})
	})
})

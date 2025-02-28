import { beforeEach, describe, expect, it } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import { flushSync } from 'svelte'
import RangeMinMax from '../src/RangeMinMax.svelte'
import '@rokkit/helpers/mocks'

describe('RangeMinMax.svelte', () => {
	const ROOT_ELEMENT = 'rk-input-range'
	const SLIDER_ELEMENT = 'rk-thumb'

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
		const props = $state({
			name: 'range',
			min: 20,
			max: 40
		})
		const { container } = render(RangeMinMax, { props })
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
	it('should render with ticks', () => {
		const props = $state({
			name: 'range',
			ticks: 5
		})
		const { container } = render(RangeMinMax, { props })
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})

	it('should render with value', () => {
		const props = $state({
			name: 'range',
			value: [30, 40]
		})
		const { container } = render(RangeMinMax, { props })
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})

	it('should handle class changes', () => {
		const props = $state({
			name: 'range',
			class: 'test'
		})
		const { container } = render(RangeMinMax, { props })
		expect(container).toMatchSnapshot()
		const range = container.querySelector(ROOT_ELEMENT)
		expect(Array.from(range.classList)).toContain('test')

		props.class = 'test2'
		flushSync()
		expect(container).toMatchSnapshot()
		expect(Array.from(range.classList)).toContain('test2')
	})

	it('should display error when value is not an array', () => {
		const props = $state({
			name: 'range',
			value: 30
		})
		const { container } = render(RangeMinMax, { props })
		expect(container).toMatchSnapshot()
	})

	it('should handle value changes', () => {
		const props = $state({
			name: 'range',
			value: [30, 40]
		})
		const { container } = render(RangeMinMax, { props })
		expect(container).toMatchSnapshot()
		props.value = [20, 30]
		flushSync()
		expect(container).toMatchSnapshot()
	})

	describe('single value', () => {
		it('should work using single mode', () => {
			const props = $state({
				name: 'range',
				single: true
			})
			const { container } = render(RangeMinMax, { props })
			expect(container).toMatchSnapshot()
			const range = container.querySelector(ROOT_ELEMENT)
			expect(range.querySelectorAll(SLIDER_ELEMENT).length).toEqual(1)
			props.single = false
			flushSync()
			expect(range.querySelectorAll(SLIDER_ELEMENT).length).toEqual(2)
		})
		it('should handle value changes', () => {
			const props = $state({
				name: 'range',
				value: [30]
			})
			const { container } = render(RangeMinMax, { props })
			expect(container).toMatchSnapshot()
			props.value = [20]
			flushSync()
			expect(container).toMatchSnapshot()
		})
	})
})

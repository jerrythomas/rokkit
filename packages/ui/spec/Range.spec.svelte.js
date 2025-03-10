import { beforeEach, describe, expect, it } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import { flushSync } from 'svelte'
import Range from '../src/Range.svelte'
import '@rokkit/helpers/mocks'

describe('Range.svelte', () => {
	const ROOT_ELEMENT = 'rk-input-range'

	beforeEach(() => cleanup())
	it('should render', () => {
		const { container } = render(Range, {
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
		const { container } = render(Range, { props })
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
	it('should render with ticks', () => {
		const props = $state({
			name: 'range',
			ticks: 5
		})
		const { container } = render(Range, { props })
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})

	it('should handle class changes', () => {
		const props = $state({
			name: 'range',
			class: 'test'
		})
		const { container } = render(Range, { props })
		expect(container).toMatchSnapshot()
		const range = container.querySelector(ROOT_ELEMENT)
		expect(Array.from(range.classList)).toContain('test')

		props.class = 'test2'
		flushSync()
		expect(container).toMatchSnapshot()
		expect(Array.from(range.classList)).toContain('test2')
	})

	it('should handle value changes', () => {
		const props = $state({
			name: 'range',
			value: 30
		})
		const { container } = render(Range, { props })
		expect(container).toMatchSnapshot()
		props.value = 20
		flushSync()
		expect(container).toMatchSnapshot()
	})
})

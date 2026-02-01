import { describe, it, expect } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import SlidingColumns from '../src/SlidingColumns.svelte'
import { flushSync, tick } from 'svelte'
import '@rokkit/helpers/mocks'

describe('SlidingColumns', () => {
	const ROOT_ELEMENT = '[data-sliding-columns-root]'
	const SEGMENT = '[data-sliding-segment]'

	it('should render correctly', () => {
		const props = $state({
			columns: ['Column 1', 'Column 2', 'Column 3']
		})
		const { container } = render(SlidingColumns, { props })

		expect(container).toMatchSnapshot()
		props.activeIndex = 1
		flushSync()
		expect(container).toMatchSnapshot()
	})

	it('should navigate to the next column', async () => {
		const props = $state({
			columns: ['Column 1', 'Column 2', 'Column 3'],
			activeIndex: 1
		})
		const { container } = render(SlidingColumns, { props })
		const root = container.querySelector(ROOT_ELEMENT)

		expect(container).toMatchSnapshot()
		expect(container.querySelector(SEGMENT).textContent).toEqual('Column 2')
		fireEvent.keyUp(root, { key: 'ArrowRight' })
		await tick()
		expect(container).toMatchSnapshot()
		expect(container.querySelector(SEGMENT).textContent).toEqual('Column 3')
	})

	it('should navigate to the previous column', async () => {
		const props = $state({
			columns: ['Column 1', 'Column 2', 'Column 3'],
			activeIndex: 1
		})
		const { container } = render(SlidingColumns, { props })
		const root = container.querySelector(ROOT_ELEMENT)

		expect(container).toMatchSnapshot()
		fireEvent.keyUp(root, { key: 'ArrowLeft' })
		await tick()
		expect(container).toMatchSnapshot()
	})
})

import { describe, it, expect, beforeEach } from 'vitest'
import { render, cleanup } from '@testing-library/svelte'
import TableCell from '../src/TableCell.svelte'
import { flushSync } from 'svelte'

describe('TableCell', () => {
	beforeEach(() => cleanup())

	it('should render a table cell', () => {
		const props = $state({ value: 'Item 1', class: 'custom-class' })
		const { container } = render(TableCell, props)
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()

		props.class = 'another-class'
		flushSync()
		expect(container).toMatchSnapshot()
	})

	it('should render a table cell with path', () => {
		const props = $state({ value: 'Item 1', path: '/origin', levels: [0] })
		const { container } = render(TableCell, props)
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()

		props.levels = [1]
		flushSync()
		expect(container).toMatchSnapshot()
	})

	it('should render a table cell as a parent', () => {
		const props = $state({
			value: 'Item 1',
			path: '/a/b',
			levels: [0, 2],
			isParent: true,
			isExpanded: false,
			depth: 1
		})
		const { container } = render(TableCell, props)
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()

		props.isExpanded = true
		flushSync()
		expect(container).toMatchSnapshot()

		props.isParent = false
		props.isExpanded = false
		flushSync()
		expect(container).toMatchSnapshot()
	})
})

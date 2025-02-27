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
})

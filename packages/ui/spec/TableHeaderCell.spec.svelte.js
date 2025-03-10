import { describe, it, expect, beforeEach } from 'vitest'
import { render, cleanup } from '@testing-library/svelte'
import TableHeaderCell from '../src/TableHeaderCell.svelte'
import { flushSync } from 'svelte'

describe('TableHeaderCell', () => {
	beforeEach(() => cleanup())

	it('should render a table header', () => {
		const props = $state({ name: 'name', class: 'custom-class' })
		const { container } = render(TableHeaderCell, props)
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()

		props.class = 'another-class'
		flushSync()
		expect(container).toMatchSnapshot()
	})
})

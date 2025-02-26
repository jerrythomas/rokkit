import { describe, it, expect, beforeEach } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import Summary from '../src/Summary.svelte'
import { flushSync } from 'svelte'

describe('Summary', () => {
	beforeEach(() => cleanup())

	it('should render ', () => {
		const props = $state({ value: 'Item 1' })
		const { container } = render(Summary, props)
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()

		props.value = 'Item 2'
		flushSync()
		expect(container).toMatchSnapshot()
	})

	it('should render using expanded state', () => {
		const props = $state({
			value: { text: 'Item 1', children: [{ text: 'Child 1' }, { text: 'Child 2' }] },
			expanded: true
		})
		const { container } = render(Summary, props)
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()

		props.expanded = false
		flushSync()
		expect(container).toMatchSnapshot()
	})
})

import { describe, it, expect, beforeEach } from 'vitest'
import { render, cleanup } from '@testing-library/svelte'
import NestedList from '../src/NestedList.svelte'
import { flushSync } from 'svelte'
import { DataWrapper } from '@rokkit/states'
import { defaultMapping } from '../src/constants'

describe('NestedList', () => {
	const items = [
		{ text: 'Item 1', _open: true, children: [{ text: 'Child 1' }, { text: 'Child 2' }] },
		{
			text: 'Item 2',
			_open: true,
			children: [
				{ text: 'Child 3', _open: true, children: [{ text: 'Grandchild 1' }] },
				{ text: 'Child 4' }
			]
		}
	]
	const wrapper = new DataWrapper(items, defaultMapping)
	beforeEach(() => cleanup())

	it('should render nested list', () => {
		const props = $state({ items, wrapper })
		const { container } = render(NestedList, props)
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()

		props.class = 'another-class'
		flushSync()
		expect(container).toMatchSnapshot()
	})
})

import { describe, it, expect, beforeEach } from 'vitest'
import { render, cleanup } from '@testing-library/svelte'
import Tree from '../src/Tree.svelte'
import { flushSync } from 'svelte'

describe('Tree', () => {
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
	beforeEach(() => cleanup())

	it('should render nested list', () => {
		const props = $state({ items })
		const { container } = render(Tree, props)
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()

		props.class = 'another-class'
		flushSync()
		expect(container).toMatchSnapshot()
	})
})

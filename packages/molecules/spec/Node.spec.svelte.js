import { describe, it, expect, beforeEach } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import Node from '../src/Node.svelte'
import { flushSync } from 'svelte'

describe('Node', () => {
	beforeEach(() => cleanup())

	it('should render', () => {
		const props = $state({ value: 'Item 1' })
		const { container } = render(Node, props)
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()

		props.class = 'another-class'
		flushSync()
		expect(container).toMatchSnapshot()
	})
})

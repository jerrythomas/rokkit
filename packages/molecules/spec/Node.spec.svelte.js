import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import Node from '../src/Node.svelte'

describe('Node', () => {
	it('should render', () => {
		const props = $state({ value: 'Item 1' })
		const { container } = render(Node, props)
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
})

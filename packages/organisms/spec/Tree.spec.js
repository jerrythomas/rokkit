import { describe, expect, it, beforeEach } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'

import Tree from '../src/Tree.svelte'

describe('Tree.svelte', () => {
	// const items = [
	// 	{ text: 'a', children: [] },
	// 	{ text: 'b', children: [] }
	// ]

	beforeEach(() => cleanup())

	it('should render empty tree', () => {
		const { container } = render(Tree)
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
	it('should render single node tree', () => {
		const { container } = render(Tree, { items: [{ text: 'a' }] })
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
	it('should render nested tree', () => {
		const { container } = render(Tree, {
			items: [{ text: 'a', children: [{ text: 'b' }, { text: 'c' }] }]
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
	it('should add root node when input has more than one item', () => {
		const { container } = render(Tree, {
			items: [{ text: 'a' }, { text: 'a' }]
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
	it('should add custom root node', () => {
		const { container } = render(Tree, {
			items: [{ text: 'a' }, { text: 'a' }],
			root: 'root'
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
	it('should render using custom field mappings', () => {
		const { container } = render(Tree, {
			items: [{ name: 'a' }, { name: 'a' }],
			fields: { text: 'name' }
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
	// it('should render items using custom component', () => {})
	// it('should expand and collapse', () => {})
	// it('should autoclose others', () => {})
	// it('should pass select and change events', () => {})
})

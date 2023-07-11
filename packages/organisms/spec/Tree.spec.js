import { describe, expect, it, beforeEach } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'

import Tree from '../src/Tree.svelte'

describe('Tree.svelte', () => {
	const items = [
		{ text: 'a', children: [] },
		{ text: 'b', children: [] }
	]

	beforeEach(() => cleanup())

	it('Should render empty tree', () => {
		const { container } = render(Tree)
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
	it('Should render single node tree', () => {
		const { container } = render(Tree, { items: [{ text: 'a' }] })
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
	it('Should render nested tree', () => {
		const { container } = render(Tree, {
			items: [{ text: 'a', children: [{ text: 'b' }, { text: 'c' }] }]
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
	it('Should add root node when input has more than one item', () => {
		const { container } = render(Tree, {
			items: [{ text: 'a' }, { text: 'a' }]
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
	it('Should add custom root node', () => {
		const { container } = render(Tree, {
			items: [{ text: 'a' }, { text: 'a' }],
			root: 'root'
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
	it('Should render using custom field mappings', () => {
		const { container } = render(Tree, {
			items: [{ name: 'a' }, { name: 'a' }],
			fields: { text: 'name' }
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
	it('Should render items using custom component', () => {})
	it('Should expand and collapse', () => {})
	it('Should autoclose others', () => {})
	it('Should pass select and change events', () => {})
})

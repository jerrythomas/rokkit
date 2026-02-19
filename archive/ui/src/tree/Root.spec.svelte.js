import { describe, it, expect, beforeEach } from 'vitest'
import { cleanup, render, fireEvent } from '@testing-library/svelte'
import Root from './Root.svelte'

describe('Tree Root Component', () => {
	const items = [
		{ id: 1, label: 'Node 1', children: [{ id: 2, label: 'Node 1.1' }] },
		{ id: 3, label: 'Node 2' }
	]

	beforeEach(() => cleanup())

	it('renders tree root with items', () => {
		const { container } = render(Root, {
			props: { items, fields: { text: 'label', children: 'children' } }
		})
		const rootEl = container.querySelector('[data-tree-root]')
		expect(rootEl).not.toBeNull()
		// const contentEls = container.querySelectorAll('[data-tree-content]')
		// expect(Array.from(contentEls).some((el) => el.textContent.includes('Node 1'))).toBe(true)
		// expect(Array.from(contentEls).some((el) => el.textContent.includes('Node 2'))).toBe(true)
		expect(rootEl).toMatchSnapshot()
	})

	// it('renders header and footer if provided', () => {
	// 	const header = () => 'Header'
	// 	const footer = () => 'Footer'
	// 	const { container } = render(Root, {
	// 		props: { items, fields: { label: 'label', children: 'children' }, header, footer }
	// 	})
	// 	expect(container.textContent).toContain('Header')
	// 	expect(container.textContent).toContain('Footer')
	// 	expect(container).toMatchSnapshot()
	// })

	it('renders empty state when items are empty', () => {
		const { container } = render(Root, {
			props: { items: [], fields: { label: 'label', children: 'children' } }
		})
		expect(container.textContent).toContain('No data available')
		expect(container).toMatchSnapshot()
	})

	// it('calls event handlers on select', async () => {
	// 	let selectedValue = null
	// 	const handleSelect = (e) => {
	// 		selectedValue = e.detail.value
	// 	}
	// 	const { container } = render(Root, {
	// 		props: {
	// 			items,
	// 			fields: { label: 'label', children: 'children' },
	// 			onselect: handleSelect
	// 		}
	// 	})
	// 	const contentEls = container.querySelectorAll('[data-tree-content]')
	// 	const node = Array.from(contentEls).find((el) => el.textContent.includes('Node 1'))
	// 	expect(node).not.toBeNull()
	// 	await fireEvent.click(node)
	// 	expect(selectedValue).toBe(items[0])
	// 	expect(container).toMatchSnapshot()
	// })
})

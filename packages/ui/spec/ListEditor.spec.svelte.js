import { describe, expect, it, beforeEach } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
// import { tick } from 'svelte'
import Register from './mocks/Register.svelte'
import ListEditor from '../src/ListEditor.svelte'
// import { MockItem } from '@rokkit/helpers/components'
// import MockListEditorWithSlot from './mocks/MockListEditorWithSlot.svelte'

describe('ListEditor.svelte', () => {
	const schema = {
		type: 'object',
		elements: [
			{
				type: 'number',
				key: 'id',
				label: 'Id',
				props: { disabled: true }
			},
			{
				type: 'text',
				key: 'text',
				label: 'Content'
			}
		]
	}
	const items = [
		{ id: 1, text: 'Alpha' },
		{ id: 2, text: 'Beta' },
		{ id: 3, text: 'Charlie' }
	]

	beforeEach(() => cleanup())

	it('should render', () => {
		// const props = $state({
		// 	Template: ListEditor,
		// 	properties: { value: items, schema }
		// })
		// const { container } = render(Register, { props })
		// expect(container).toBeTruthy()
		// expect(container).toMatchSnapshot()
	})

	// it('should render with path', () => {
	// 	const { container } = render(Register, {
	// 		render: ListEditor,
	// 		properties: { value: items, schema, path: ['items'] }
	// 	})
	// 	expect(container).toBeTruthy()
	// 	expect(container).toMatchSnapshot()
	// })

	// it('should render with custom components', async () => {
	// 	const { container, component } = render(Register, {
	// 		render: ListEditor,
	// 		using: { components: {} },
	// 		properties: { value: items, schema, path: ['items'], class: 'my-list' }
	// 	})
	// 	component.$set({ using: { components: { default: MockItem } } })
	// 	await tick()
	// 	expect(container.querySelector('.my-list')).toBeTruthy()
	// 	expect(container).toMatchSnapshot()

	// 	component.$set({
	// 		properties: { value: items, schema, path: ['x'], class: 'new-list' }
	// 	})
	// 	await tick()
	// 	expect(container.querySelector('.my-list')).toBeFalsy()
	// 	expect(container.querySelector('.new-list')).toBeTruthy()
	// 	expect(container).toMatchSnapshot()
	// })

	// it('should render when item is selected', async () => {
	// 	const { container } = render(Register, {
	// 		render: ListEditor,
	// 		properties: { value: items, schema }
	// 	})
	// 	expect(container).toBeTruthy()
	// 	const listItems = container.querySelectorAll('list-editor list item')
	// 	expect(listItems.length).toBe(3)
	// 	await fireEvent.click(listItems[2])
	// 	await tick()
	// 	expect(container).toMatchSnapshot()
	// })

	// it('should render slot content', async () => {
	// 	const { container, component } = render(Register, {
	// 		render: MockListEditorWithSlot,
	// 		properties: { value: items, schema }
	// 	})
	// 	expect(container).toMatchSnapshot()

	// 	component.$set({ properties: { value: items, schema, below: true } })
	// 	await tick()
	// 	expect(container).toMatchSnapshot()
	// })
})

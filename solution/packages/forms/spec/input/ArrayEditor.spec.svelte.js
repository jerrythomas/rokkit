import { describe, expect, beforeEach, it, vi } from 'vitest'
import { cleanup, render, fireEvent } from '@testing-library/svelte'
import { flushSync } from 'svelte'

import ArrayEditor from '../../src/input/ArrayEditor.svelte'

describe('ArrayEditor', () => {
	beforeEach(() => cleanup())

	describe('primitive items (string array)', () => {
		it('renders [data-array-editor]', () => {
			const props = $state({ value: [] })
			const { container } = render(ArrayEditor, { props })
			expect(container.querySelector('[data-array-editor]')).toBeTruthy()
		})

		it('renders one [data-array-editor-item] per element', () => {
			const props = $state({ value: ['foo', 'bar', 'baz'] })
			const { container } = render(ArrayEditor, { props })
			const items = container.querySelectorAll('[data-array-editor-item]')
			expect(items).toHaveLength(3)
		})

		it('add button appends default item and calls onchange', async () => {
			const onchange = vi.fn()
			const props = $state({ value: ['foo'], onchange })
			const { container } = render(ArrayEditor, { props })

			const addBtn = container.querySelector('[data-array-editor-add]')
			await fireEvent.click(addBtn)

			expect(onchange).toHaveBeenCalledWith(['foo', ''])
		})

		it('remove button at index removes item and calls onchange', async () => {
			const onchange = vi.fn()
			const props = $state({ value: ['foo', 'bar', 'baz'], onchange })
			const { container } = render(ArrayEditor, { props })

			const removeButtons = container.querySelectorAll('[data-array-editor-remove]')
			await fireEvent.click(removeButtons[1])

			expect(onchange).toHaveBeenCalledWith(['foo', 'baz'])
		})

		it('item input change calls onchange with updated value', async () => {
			const onchange = vi.fn()
			const props = $state({ value: ['foo', 'bar'], onchange })
			const { container } = render(ArrayEditor, { props })

			const inputs = container.querySelectorAll('input')
			await fireEvent.change(inputs[0], { target: { value: 'updated' } })

			expect(onchange).toHaveBeenCalledWith(['updated', 'bar'])
		})

		it('[data-array-editor-empty] present when array is empty', () => {
			const props = $state({ value: [] })
			const { container } = render(ArrayEditor, { props })
			const root = container.querySelector('[data-array-editor]')
			expect(root.hasAttribute('data-array-editor-empty')).toBe(true)
		})

		it('[data-array-editor-empty] absent when array has items', () => {
			const props = $state({ value: ['foo'] })
			const { container } = render(ArrayEditor, { props })
			const root = container.querySelector('[data-array-editor]')
			expect(root.hasAttribute('data-array-editor-empty')).toBe(false)
		})

		it('add and remove buttons hidden when readonly=true', () => {
			const props = $state({ value: ['foo'], readonly: true })
			const { container } = render(ArrayEditor, { props })
			expect(container.querySelector('[data-array-editor-add]')).toBeNull()
			expect(container.querySelector('[data-array-editor-remove]')).toBeNull()
		})

		it('buttons are disabled when disabled=true', () => {
			const props = $state({ value: ['foo'], disabled: true })
			const { container } = render(ArrayEditor, { props })
			const addBtn = container.querySelector('[data-array-editor-add]')
			const removeBtn = container.querySelector('[data-array-editor-remove]')
			expect(addBtn.disabled).toBe(true)
			expect(removeBtn.disabled).toBe(true)
		})

		it('[data-array-editor-disabled] on root when disabled', () => {
			const props = $state({ value: ['foo'], disabled: true })
			const { container } = render(ArrayEditor, { props })
			const root = container.querySelector('[data-array-editor]')
			expect(root.hasAttribute('data-array-editor-disabled')).toBe(true)
		})

		it('[data-array-editor-disabled] absent when not disabled', () => {
			const props = $state({ value: ['foo'] })
			const { container } = render(ArrayEditor, { props })
			const root = container.querySelector('[data-array-editor]')
			expect(root.hasAttribute('data-array-editor-disabled')).toBe(false)
		})
	})

	describe('object items (sub-form array)', () => {
		const itemsSchema = {
			type: 'object',
			properties: {
				name: { type: 'string' }
			}
		}

		it('renders FormRenderer per item when items.type === "object"', () => {
			const props = $state({
				value: [{ name: 'Alice' }, { name: 'Bob' }],
				items: itemsSchema
			})
			const { container } = render(ArrayEditor, { props })
			const forms = container.querySelectorAll('[data-form-root]')
			expect(forms).toHaveLength(2)
		})

		it('add button appends default object matching sub-schema', async () => {
			const onchange = vi.fn()
			const props = $state({
				value: [{ name: 'Alice' }],
				items: itemsSchema,
				onchange
			})
			const { container } = render(ArrayEditor, { props })

			const addBtn = container.querySelector('[data-array-editor-add]')
			await fireEvent.click(addBtn)

			expect(onchange).toHaveBeenCalledWith([{ name: 'Alice' }, { name: '' }])
		})

		it('sub-form field change propagates via onchange', async () => {
			const onchange = vi.fn()
			const props = $state({
				value: [{ name: 'Alice' }],
				items: itemsSchema,
				onchange
			})
			const { container } = render(ArrayEditor, { props })

			const input = container.querySelector('input')
			await fireEvent.change(input, { target: { value: 'Bob' } })

			expect(onchange).toHaveBeenCalledWith([{ name: 'Bob' }])
		})
	})

	describe('edge cases', () => {
		it('null/non-array value treated as []', () => {
			const props = $state({ value: null })
			const { container } = render(ArrayEditor, { props })
			const items = container.querySelectorAll('[data-array-editor-item]')
			expect(items).toHaveLength(0)
			const root = container.querySelector('[data-array-editor]')
			expect(root.hasAttribute('data-array-editor-empty')).toBe(true)
		})

		it('no items prop defaults to string item type', async () => {
			const onchange = vi.fn()
			const props = $state({ value: [], onchange })
			const { container } = render(ArrayEditor, { props })

			const addBtn = container.querySelector('[data-array-editor-add]')
			await fireEvent.click(addBtn)

			expect(onchange).toHaveBeenCalledWith([''])
		})

		it('disabled=true disables buttons reactively', () => {
			const props = $state({ value: ['foo'], disabled: false })
			const { container } = render(ArrayEditor, { props })

			const addBtn = container.querySelector('[data-array-editor-add]')
			expect(addBtn.disabled).toBe(false)

			props.disabled = true
			flushSync()
			expect(addBtn.disabled).toBe(true)
		})
	})
})

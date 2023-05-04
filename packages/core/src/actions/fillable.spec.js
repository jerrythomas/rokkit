import { vi, it, expect, describe, beforeEach } from 'vitest'
import { fillable } from './fillable'

describe('fillable', () => {
	let node, options, current, check, fillableAction
	beforeEach(() => {
		node = document.createElement('div')
		options = [{ actualIndex: 0, value: 'Option 1' }]
		current = 0
		check = false
		fillableAction = fillable(node, { options, current, check })
	})

	it('should initialize the empty fillable element with click listener', () => {
		let del = [document.createElement('del'), document.createElement('del')]

		del.map((d) => {
			d.addEventListener = vi.fn()
			d.removeEventListener = vi.fn()
			node.appendChild(d)
		})

		const fillableAction = fillable(node, { options, current, check })

		del.map((d, index) => {
			expect(d.classList.contains('empty')).toBe(true)
			expect(d.name).toEqual('fill-' + index)
			expect(d['data-index']).toEqual(index.toString())
			expect(d.addEventListener).toHaveBeenCalledWith(
				'click',
				expect.any(Function)
			)
		})

		fillableAction.destroy()
		del.map((d) => {
			expect(d.removeEventListener).toHaveBeenCalledWith(
				'click',
				expect.any(Function)
			)
			node.removeChild(d)
		})
	})

	it('should fill the fillable element with the current option value', () => {
		let del = document.createElement('del')
		node.appendChild(del)
		fillableAction = fillable(node, { options, current, check })

		fillableAction.update({ options, current })

		expect(del.innerHTML).toBe('Option 1')
		expect(del.classList.contains('filled')).toBe(true)
	})

	it('should clear the filled fillable element on click', () => {
		let del = document.createElement('del')
		node.appendChild(del)
		fillableAction = fillable(node, { options, current, check })

		fillableAction.update({ options, current })
		del.dispatchEvent(new MouseEvent('click'))

		expect(del.innerHTML).toBe('?')
		expect(del.classList.contains('empty')).toBe(true)
		expect(del.classList.contains('filled')).toBe(false)
	})

	it('should validate the filled values', () => {
		let del = document.createElement('del')
		node.appendChild(del)
		options = [{ actualIndex: 0, value: 'Option 1', expectedIndex: 0 }]
		check = true
		fillableAction = fillable(node, { options, current, check })

		fillableAction.update({ options, current })

		expect(del.classList.contains('pass')).toBe(true)
	})
	it('should validate the filled values', () => {
		let del = document.createElement('del')
		node.appendChild(del)
		options = [{ actualIndex: 0, value: 'Option 1', expectedIndex: 1 }]
		check = true
		fillableAction = fillable(node, { options, current, check })

		fillableAction.update({ options, current })

		expect(del.classList.contains('fail')).toBe(true)
	})

	it('should destroy the fillable element listener', () => {
		let del = document.createElement('del')
		del.removeEventListener = vi.fn()
		node.appendChild(del)
		fillableAction = fillable(node, { options, current, check })
		fillableAction.destroy()
		expect(del.removeEventListener).toHaveBeenCalledWith(
			'click',
			expect.any(Function)
		)
	})
})

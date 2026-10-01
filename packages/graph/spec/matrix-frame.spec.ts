/* The matrix's frame and highlight, as pure functions — the component only draws them. */
import { describe, it, expect, afterEach } from 'vitest'
import { messages } from '@rokkit/states'
import { matrixFrame, cellState, matrixLabel } from '../src/layout/matrix.js'

afterEach(() => messages.reset())

describe('matrixFrame', () => {
	it('sizes the label gutter by the longest name, within bounds, and the canvas around it', () => {
		const frame = matrixFrame({ labels: ['a', 'bb'], order: ['a', 'b'] }, 18)
		expect(frame.labelW).toBe(48)
		expect(frame).toMatchObject({ n: 2, width: 48 + 2 * 18 + 8, height: 48 + 2 * 18 + 8 })
		expect(matrixFrame({ labels: ['x'.repeat(200)], order: ['x'] }, 18).labelW).toBe(220)
	})
})

describe('cellState', () => {
	it('highlights a cell on the selected node’s row or column, and nothing without a selection', () => {
		expect(cellState('a', 'a', 'b')).toBe('highlight')
		expect(cellState('b', 'a', 'b')).toBe('highlight')
		expect(cellState('c', 'a', 'b')).toBeUndefined()
		expect(cellState(null, 'a', 'b')).toBeUndefined()
	})
})

describe('matrixLabel', () => {
	it('names the matrix by what it holds, from the locale', () => {
		expect(matrixLabel(3, 1, 0)).toBe('Dependency matrix: 3 nodes, 1 dependency, 0 above the diagonal')
		messages.register('de', { graph: { matrix: 'Matrix: {nodes}' } })
		messages.setLocale('de')
		expect(matrixLabel(3, 1, 0)).toBe('Matrix: 3 nodes')
	})
})

import { describe, it, expect } from 'vitest'
import { traversable } from '../../src/traversable'
import { mockStore } from '../mocks/store'
import { toUseHandlersFor } from 'validators'

expect.extend({ toUseHandlersFor })

describe('traversable', () => {
	describe('setup', () => {
		it('should use handlers and cleanup on destroy', () => {
			const events = ['keydown', 'click']
			let data = { store: mockStore }
			expect(traversable).toUseHandlersFor(data, events)
			data = { store: mockStore, options: { horizontal: true } }
			expect(traversable).toUseHandlersFor(data, events)
		})

		it('should use handlers when dragging is enabled', () => {
			const events = ['keydown', 'click', 'dragstart']
			let data = { store: mockStore, options: { allowDrag: true } }
			expect(traversable).toUseHandlersFor(data, events)
			data = { store: mockStore, options: { allowDrag: true, horizontal: true } }
			expect(traversable).toUseHandlersFor(data, events)
		})

		it('should use handlers when dropping is enabled', () => {
			const events = ['keydown', 'click', 'dragover', 'drop']
			let data = { store: mockStore, options: { allowDrop: true } }
			expect(traversable).toUseHandlersFor(data, events)
			data = { store: mockStore, options: { allowDrop: true, horizontal: true } }
			expect(traversable).toUseHandlersFor(data, events)
		})

		// it('should update the handlers when config changes', () => {})
	})
})

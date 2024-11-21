import { describe, it, expect } from 'vitest'
import { mockStore } from '../mocks/store'
import { traversable } from '../../src/traversable.svelte'
import { flushSync } from 'svelte'

describe('traversable', () => {
	const node = document.createElement('div')

	describe('setup', () => {
		it('should use handlers and cleanup on destroy', () => {
			const addEventSpy = vi.spyOn(node, 'addEventListener')
			const removeEventSpy = vi.spyOn(node, 'removeEventListener')

			const events = ['keydown', 'click']
			const data = $state({ store: mockStore, options: {} })
			const cleanup = $effect.root(() => traversable(node, data))
			flushSync()

			events.forEach((event) =>
				expect(addEventSpy).toHaveBeenCalledWith(event, expect.any(Function), {})
			)

			data.options.horizontal = true
			flushSync()
			expect(addEventSpy).toHaveBeenCalledTimes(events.length * 2)
			expect(removeEventSpy).toHaveBeenCalledTimes(events.length)

			cleanup()
			expect(removeEventSpy).toHaveBeenCalledTimes(events.length * 2)
		})

		it('should use handlers when dragging is enabled', () => {
			const events = ['keydown', 'click', 'dragstart']
			const data = $state({ store: mockStore, options: { allowDrag: true } })
			const addEventSpy = vi.spyOn(node, 'addEventListener')
			const removeEventSpy = vi.spyOn(node, 'removeEventListener')

			const cleanup = $effect.root(() => traversable(node, data))
			flushSync()

			events.forEach((event) =>
				expect(addEventSpy).toHaveBeenCalledWith(event, expect.any(Function), {})
			)

			data.options.horizontal = true
			flushSync()
			expect(addEventSpy).toHaveBeenCalledTimes(events.length * 2)
			expect(removeEventSpy).toHaveBeenCalledTimes(events.length)

			cleanup()
			expect(removeEventSpy).toHaveBeenCalledTimes(events.length * 2)
		})

		it('should use handlers when dropping is enabled', () => {
			const events = ['keydown', 'click', 'dragover', 'drop']
			const data = $state({ store: mockStore, options: { allowDrop: true } })
			const addEventSpy = vi.spyOn(node, 'addEventListener')
			const removeEventSpy = vi.spyOn(node, 'removeEventListener')

			const cleanup = $effect.root(() => traversable(node, data))
			flushSync()

			events.forEach((event) =>
				expect(addEventSpy).toHaveBeenCalledWith(event, expect.any(Function), {})
			)

			data.options.horizontal = true
			flushSync()
			expect(addEventSpy).toHaveBeenCalledTimes(events.length * 2)
			expect(removeEventSpy).toHaveBeenCalledTimes(events.length)

			cleanup()
			expect(removeEventSpy).toHaveBeenCalledTimes(events.length * 2)
		})
	})
})

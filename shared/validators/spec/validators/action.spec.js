import { describe, it, expect, vi, afterEach } from 'vitest'
import { toOnlyTrigger, toUseHandlersFor } from '../../src/validators/action'

describe('action', () => {
	describe('toOnlyTrigger', () => {
		const handler = {
			a: vi.fn(),
			b: vi.fn(),
			c: vi.fn()
		}

		expect.extend({ toOnlyTrigger })
		afterEach(() => {
			vi.resetAllMocks()
		})

		it('should pass if only the specified events are triggered', () => {
			let result = toOnlyTrigger(handler, 'a')
			expect(result.pass).toBe(false)
			expect(result.message()).toBe(
				'Expected only [a] to be called once and the other handlers to not be called'
			)
			expect(handler).not.toOnlyTrigger('a')

			handler.a()
			result = toOnlyTrigger(handler, 'a')
			expect(result.pass).toBe(true)
			expect(result.message()).toBe(
				'Expected other handlers besides [a] to be called, but none were'
			)
			expect(handler).toOnlyTrigger('a')

			handler.b()
			result = toOnlyTrigger(handler, ['a', 'b'])
			expect(result.pass).toBe(true)
			expect(result.message()).toBe(
				'Expected other handlers besides [a, b] to be called, but none were'
			)
			expect(handler).toOnlyTrigger(['a', 'b'])
		})

		it('should fail if no/other events are triggered', () => {
			let result = toOnlyTrigger(handler, ['a', 'b'])
			expect(result.pass).toBe(false)

			handler.c()
			result = toOnlyTrigger(handler, ['a', 'b'])
			expect(result.pass).toBe(false)
			expect(result.message()).toBe(
				'Expected only [a, b] to be called once and the other handlers to not be called'
			)
			expect(handler).not.toOnlyTrigger(['a', 'b'])
		})

		it('should fail if event is not in handler', () => {
			const result = toOnlyTrigger(handler, ['x'])
			expect(result.pass).toBe(false)
			expect(result.message()).toBe(
				'Expected events from [a, b, c] but got unexpected events [x]'
			)
			expect(handler).not.toOnlyTrigger(['a', 'b'])
		})
	})

	describe('toUseHandlersFor', () => {
		const mockAction = (node, options) => {
			const handler = () => {}
			node.addEventListener('click', handler)
			if (options.touch) node.addEventListener('touchstart', handler)
			return {
				destroy: () => {
					node.removeEventListener('click', handler)
					if (options.touch) node.removeEventListener('touchstart', handler)
				}
			}
		}
		expect.extend({ toUseHandlersFor })

		it('should pass if all events are registered and cleanued up', () => {
			let result = toUseHandlersFor(mockAction, {}, 'click')
			expect(result.pass).toBe(true)
			expect(result.message()).toBe(
				'Expected action not to manage handlers for [click] but result is [{"event":"click","created":true,"destroyed":true,"pass":true}]'
			)
			expect(mockAction).toUseHandlersFor({}, 'click')

			result = toUseHandlersFor(mockAction, { touch: true }, [
				'click',
				'touchstart'
			])
			expect(result.pass).toBe(true)
			expect(result.message()).toBe(
				'Expected action not to manage handlers for [click,touchstart] but result is [{"event":"click","created":true,"destroyed":true,"pass":true},{"event":"touchstart","created":true,"destroyed":true,"pass":true}]'
			)
			expect(mockAction).toUseHandlersFor({ touch: true }, [
				'click',
				'touchstart'
			])
		})

		it('should fail if all events are not registered or not cleaned up', () => {
			const result = toUseHandlersFor(mockAction, {}, ['click', 'touchstart'])
			expect(result.pass).toBe(false)
			expect(result.message()).toBe(
				'Expected action to manage handlers for [click,touchstart] but result is [{"event":"click","created":true,"destroyed":true,"pass":true},{"event":"touchstart","created":false,"destroyed":true,"pass":false}]'
			)
			expect(mockAction).not.toUseHandlersFor({}, ['click', 'touchstart'])
		})
	})
})

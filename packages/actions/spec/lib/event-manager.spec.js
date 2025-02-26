import { EventManager } from '../../src/lib/event-manager'
import { describe, it, expect, vi, afterEach } from 'vitest'

describe('EventManager', () => {
	const element = { addEventListener: vi.fn(), removeEventListener: vi.fn() }
	const handlers = { click: vi.fn() }
	let manager = null

	afterEach(() => {
		if (manager) manager.reset()
		vi.resetAllMocks()
	})

	it('should call activate and reset', () => {
		manager = EventManager(element, handlers)

		expect(element.addEventListener).toHaveBeenCalledWith('click', expect.any(Function), {})

		manager.reset()
		expect(element.removeEventListener).toHaveBeenCalledWith('click', expect.any(Function), {})
		expect(element.addEventListener).toHaveBeenCalledTimes(1)
		expect(element.removeEventListener).toHaveBeenCalledTimes(1)
	})

	it('should remove and add event handlers on update', () => {
		manager = EventManager(element, handlers)
		manager.update()
		expect(element.addEventListener).toHaveBeenCalledWith('click', expect.any(Function), {})
		manager.reset()
		expect(element.removeEventListener).toHaveBeenCalledWith('click', expect.any(Function), {})
		expect(element.addEventListener).toHaveBeenCalledTimes(1)
		expect(element.removeEventListener).toHaveBeenCalledTimes(1)
	})

	it('should update the event handlers', () => {
		const handlers1 = { click: vi.fn() }
		const handlers2 = { click: vi.fn() }
		manager = EventManager(element, handlers1)
		expect(element.addEventListener).toHaveBeenCalledWith('click', expect.any(Function), {})
		manager.update(handlers1, false)
		expect(element.addEventListener).toHaveBeenCalledTimes(1)
		manager.update()
		expect(element.addEventListener).toHaveBeenCalledTimes(1)

		manager.update(handlers2)
		expect(element.addEventListener).toHaveBeenCalledTimes(2)
		expect(element.removeEventListener).toHaveBeenCalledWith('click', expect.any(Function), {})
		expect(element.addEventListener).toHaveBeenCalledWith('click', expect.any(Function), {})
		expect(element.removeEventListener).toHaveBeenCalledTimes(1)
	})

	it('should not call addEventListener or removeEventListener multiple times', () => {
		manager = EventManager(element, handlers)

		manager.update()
		manager.reset()
		manager.reset()

		expect(element.addEventListener).toHaveBeenCalledTimes(1)
		expect(element.removeEventListener).toHaveBeenCalledTimes(1)
	})
})

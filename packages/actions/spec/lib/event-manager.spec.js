import { EventManager } from '../../src/lib/event-manager'
import { describe, it, expect, vi, afterEach } from 'vitest'

describe('EventManager', () => {
	const element = { addEventListener: vi.fn(), removeEventListener: vi.fn() }
	const handlers = { click: vi.fn() }
	let manager

	afterEach(() => {
		if (manager) manager.reset()
		vi.resetAllMocks()
	})

	it('should call activate and reset', () => {
		manager = EventManager(element, handlers)
		manager.activate()
		expect(element.addEventListener).toHaveBeenCalledWith(
			'click',
			handlers.click
		)

		manager.reset()
		expect(element.removeEventListener).toHaveBeenCalledWith(
			'click',
			handlers.click
		)
		expect(element.addEventListener).toHaveBeenCalledTimes(1)
		expect(element.removeEventListener).toHaveBeenCalledTimes(1)
	})

	it('should remove and add event handlers on update', () => {
		manager = EventManager(element, handlers)
		manager.update()
		expect(element.addEventListener).toHaveBeenCalledWith(
			'click',
			handlers.click
		)
		manager.reset()
		expect(element.removeEventListener).toHaveBeenCalledWith(
			'click',
			handlers.click
		)
		expect(element.addEventListener).toHaveBeenCalledTimes(1)
		expect(element.removeEventListener).toHaveBeenCalledTimes(1)
	})

	it('should update the event handlers', () => {
		const handlers1 = { click: vi.fn() }
		const handlers2 = { click: vi.fn() }
		manager = EventManager(element, handlers1)
		manager.update(handlers1, false)
		expect(element.addEventListener).not.toHaveBeenCalled()
		manager.update()
		expect(element.addEventListener).toHaveBeenCalledWith(
			'click',
			handlers1.click
		)
		manager.update(handlers2)
		expect(element.removeEventListener).toHaveBeenCalledWith(
			'click',
			handlers1.click
		)
		expect(element.addEventListener).toHaveBeenCalledWith(
			'click',
			handlers2.click
		)
		expect(element.addEventListener).toHaveBeenCalledTimes(2)
		expect(element.removeEventListener).toHaveBeenCalledTimes(1)
	})

	it('should not call addEventListener or removeEventListener multiple times', () => {
		manager = EventManager(element, handlers)

		manager.activate()
		manager.activate()
		manager.update()
		manager.reset()
		manager.reset()

		expect(element.addEventListener).toHaveBeenCalledTimes(1)
		expect(element.removeEventListener).toHaveBeenCalledTimes(1)
	})
})

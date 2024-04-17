import { describe, it, expect, vi } from 'vitest'
import { createNotificationStore } from '../src/notifications'
import { get } from 'svelte/store'

describe('notifications', () => {
	const defaultKeys = ['id', 'timeout', 'message', 'type']
	const types = ['default', 'danger', 'warning', 'info', 'success']

	const input = [
		{ message: 'a default message', type: 'default' },
		{ message: 'a danger message', type: 'danger' },
		{ message: 'a warning message', type: 'warning' },
		{ message: 'a success message', type: 'success', timeout: 1000 },
		{ message: 'an informational message', type: 'info', timeout: 1000 }
	]

	it('should send a notification', () => {
		const alerts = createNotificationStore()

		input.forEach((item, index) => {
			alerts.send(item.message, item.type, item.timeout)
			const items = get(alerts)
			expect(items.length).toBe(index + 1)
			expect(Object.keys(items[index])).toEqual(defaultKeys)
			expect(items[index].message).toEqual(item.message)
			expect(items[index].type).toEqual(item.type)
			expect(items[index].timeout).toEqual(item.timeout ?? 3000)
		})
	})

	it.each(types)('should send a "%s" notification', (type) => {
		const alerts = createNotificationStore()
		alerts[type]('a message')

		let items = get(alerts)
		expect(items.length).toEqual(1)
		expect(Object.keys(items[0])).toEqual(defaultKeys)
		expect(items[0].message).toEqual('a message')
		expect(items[0].type).toEqual(type)
		expect(items[0].timeout).toEqual(3000)

		alerts[type]('a message with timeout', 1000)
		items = get(alerts)
		expect(items.length).toEqual(2)
		expect(Object.keys(items[0])).toEqual(defaultKeys)
		expect(items[1].message).toEqual('a message with timeout')
		expect(items[1].type).toEqual(type)
		expect(items[1].timeout).toEqual(1000)

		alerts[type]({ text: 'object as message', timeout: 2000 })
		items = get(alerts)
		expect(items.length).toEqual(3)
		expect(Object.keys(items[2])).toEqual(defaultKeys)
		expect(Object.keys(items[2].message)).toEqual(['text'])
		expect(items[2].message.text).toEqual('object as message')
		expect(items[2].type).toEqual(type)
		expect(items[2].timeout).toEqual(2000)

		alerts[type]({ text: 'object as message' })
		items = get(alerts)
		expect(items.length).toEqual(4)
		expect(Object.keys(items[3])).toEqual(defaultKeys)
		expect(Object.keys(items[3].message)).toEqual(['text'])
		expect(items[3].message.text).toEqual('object as message')
		expect(items[3].type).toEqual(type)
		expect(items[3].timeout).toEqual(3000)
	})

	it('should remove notifications after timeout', async () => {
		const expected = input.map((item) => ({
			...item,
			timeout: item.timeout ?? 3000
		}))

		vi.useFakeTimers()
		const alerts = createNotificationStore()

		input.forEach((item) => alerts.send(item.message, item.type, item.timeout))
		const items = get(alerts)
		expect(items.length).toEqual(5)

		alerts.subscribe((items) => {
			expect(items.length).toEqual(expected.length)
			if (items.length > 0) {
				expect(Object.keys(items[0])).toEqual(defaultKeys)
				expect(items[0].message).toEqual(expected[0].message)
				expect(items[0].type).toEqual(expected[0].type)
				expect(items[0].timeout).toEqual(expected[0].timeout)
			}
		})

		for (let index = 0; index < 5; index++) {
			expected.shift()
			await vi.advanceTimersByTime(input[index].timeout ?? 3000)
		}
		vi.clearAllTimers()
	})

	it('should clear notifications', () => {
		const alerts = createNotificationStore()
		input.forEach((item) => alerts.send(item.message, item.type, item.timeout))
		let items = get(alerts)
		expect(items.length).toEqual(5)

		alerts.clear()
		items = get(alerts)
		expect(items.length).toEqual(0)
	})
})

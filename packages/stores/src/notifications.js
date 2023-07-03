import { writable, derived } from 'svelte/store'
import { id } from '@rokkit/core'

const TIMEOUT = 3000

export function createNotificationStore() {
	const messages = writable([])

	function send(message, type = 'default', timeout) {
		const content = typeof message === 'string' ? { message } : message
		messages.update((state) => {
			return [
				...state,
				{ id: id(), timeout: timeout ?? TIMEOUT, ...content, type }
			]
		})
	}

	const notifications = derived(messages, ($messages, set) => {
		set($messages)
		if ($messages.length > 0) {
			const timer = setInterval(() => {
				messages.update((items) => {
					items.shift()
					return items
				})
			}, $messages[0].timeout)
			return () => {
				clearTimeout(timer)
			}
		}
	})
	const { subscribe } = notifications

	return {
		subscribe,
		send,
		default: (msg, timeout) => send(msg, 'default', timeout),
		danger: (msg, timeout) => send(msg, 'danger', timeout),
		warning: (msg, timeout) => send(msg, 'warning', timeout),
		info: (msg, timeout) => send(msg, 'info', timeout),
		success: (msg, timeout) => send(msg, 'success', timeout)
	}
}

export const alerts = createNotificationStore()

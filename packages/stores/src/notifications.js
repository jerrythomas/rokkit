import { writable, derived } from 'svelte/store'
import { id } from '@rokkit/core'
import { omit } from 'ramda'

const TIMEOUT = 3000

export function createNotificationStore() {
	const messages = writable([])
	const send = (message, type = 'default', timeout) => {
		addMessage(messages, message, type, timeout)
	}

	const { subscribe } = getDerivedNotifications(messages)

	return {
		subscribe,
		clear: () => messages.set([]),
		send,
		default: (msg, timeout) => send(msg, 'default', timeout),
		danger: (msg, timeout) => send(msg, 'danger', timeout),
		warning: (msg, timeout) => send(msg, 'warning', timeout),
		info: (msg, timeout) => send(msg, 'info', timeout),
		success: (msg, timeout) => send(msg, 'success', timeout)
	}
}

export const alerts = createNotificationStore()

function addMessage(messages, message, type = 'default', timeout) {
	if (typeof message === 'object') {
		message = {
			message: omit(['timeout'], message),
			timeout: message.timeout ?? timeout ?? TIMEOUT
		}
	} else message = { message }
	messages.update((state) => [
		...state,
		{ id: id(), timeout: timeout ?? TIMEOUT, ...message, type }
	])
}

function getDerivedNotifications(messages) {
	return derived(messages, ($messages, set) => {
		set($messages)
		if ($messages.length > 0) {
			const timer = setInterval(() => {
				messages.update((items) => {
					items.shift()
					return items
				})
			}, $messages[0].timeout)
			return () => clearTimeout(timer)
		}
	})
}

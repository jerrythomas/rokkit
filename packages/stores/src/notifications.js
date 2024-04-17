import { omit } from 'ramda'
import { writable, derived } from 'svelte/store'
import { id } from '@rokkit/core'

const TIMEOUT = 3000

/**
 * Creates a notification store that can manage and display notifications.
 * Allows for sending notifications of various types and clearing all notifications.
 *
 * @returns {Object} An object containing methods to interact with the notification store.
 */
export function createNotificationStore() {
	const messages = writable([])
	const { subscribe } = getDerivedNotifications(messages)

	return {
		subscribe,
		clear: () => messages.set([]),
		send: (message, type, timeout) => addMessage(messages, message, type, timeout),
		default: (msg, timeout) => addMessage(messages, msg, 'default', timeout),
		danger: (msg, timeout) => addMessage(messages, msg, 'danger', timeout),
		warning: (msg, timeout) => addMessage(messages, msg, 'warning', timeout),
		info: (msg, timeout) => addMessage(messages, msg, 'info', timeout),
		success: (msg, timeout) => addMessage(messages, msg, 'success', timeout)
	}
}

export const alerts = createNotificationStore()

/**
 * Adds a new message to the notification queue.
 *
 * @param {import('svelte/store').Writable} messages          - A Svelte writable store containing the notification messages.
 * @param {String|Object}                   message           - The notification message or object with details.
 * @param {String}                          [type='default']  - The type of notification (e.g., 'default', 'info').
 * @param {Number}                          [timeout=TIMEOUT] - Duration in milliseconds before the notification is automatically dismissed.
 */
function addMessage(messages, message, type = 'default', timeout = TIMEOUT) {
	if (typeof message === 'object') {
		message = {
			message: omit(['timeout'], message),
			timeout: message.timeout ?? timeout
		}
	} else message = { message }
	messages.update((state) => [...state, { id: id(), timeout, ...message, type }])
}

/**
 * Creates a derived notification store that auto-dismisses notifications after their timeout.
 *
 * @param {import('svelte/store').Writable} messages - A writable store containing the notification messages.
 * @returns {Readable}                      A Svelte readable store derived from the input writable store,
 *                                          containing logic for auto-dismissal of notifications.
 */
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

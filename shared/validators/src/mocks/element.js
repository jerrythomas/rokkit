import { vi } from 'vitest'
/**
 * Creates a mock node with functions to add and remove event handlers
 *
 * @param {Array<string} events
 * @returns
 */
export function getMockNode(events) {
	let listeners = events.reduce((acc, event) => ({ ...acc, [event]: 0 }), {})

	const node = {
		addEventListener: vi.fn().mockImplementation((name) => ++listeners[name]),
		removeEventListener: vi.fn().mockImplementation((name) => --listeners[name])
	}
	return { node, listeners }
}

export function createNestedElement(item) {
	const element = document.createElement(item.name)
	if (item.dataPath) {
		element.setAttribute('data-path', item.dataPath)
	}
	if (item.id) {
		element.setAttribute('id', item.id)
	}
	element.scrollIntoView = vi.fn()

	if (item.children && Array.isArray(item.children)) {
		for (const child of item.children) {
			element.appendChild(createNestedElement(child))
		}
	}
	return element
}

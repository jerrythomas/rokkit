import { vi } from 'vitest'

/**
 * Creates an array of elements with the specified size
 *
 * @param {number} count
 * @param {number} size
 * @param {string} [prop='offsetHeight']
 * @returns {Array<Object<string, number>>}
 */
export function elementsWithSize(count, size, prop = 'offsetHeight') {
	return Array.from({ length: count }, () => ({
		[prop]: size
	}))
}

/**
 * Creates an array of elements with mixed sizes
 *
 * @param {Array<{count: number, size: number}>} data
 * @param {string} prop
 * @returns {Array<Object<string, number>>}
 */
export function mixedSizeElements(data, prop) {
	return data.reduce(
		(elements, { count, size }) => [...elements, ...elementsWithSize(count, size, prop)],
		[]
	)
}

/**
 * Creates a mock node with functions to add and remove event handlers
 *
 * @param {Array<string} events
 * @returns {{node: HTMLElement, listeners: Object<string, integer>}}
 */
export function getMockNode(events) {
	const listeners = events.reduce((acc, event) => ({ ...acc, [event]: 0 }), {})

	const node = {
		dispatchEvent: vi.fn(),
		scrollTo: vi.fn(),
		querySelectorAll: vi.fn().mockImplementation((selector) => {
			return [document.createElement(selector)]
		}),
		querySelector: vi.fn().mockImplementation((selector) => {
			return document.createElement(selector)
		}),
		addEventListener: vi.fn().mockImplementation((name) => ++listeners[name]),
		removeEventListener: vi.fn().mockImplementation((name) => --listeners[name])
	}
	return { node, listeners }
}

/**
 * @typedef {Object} NestedItem
 * @property {string} name
 * @property {string} [dataPath]
 * @property {string} [id]
 * @property {Array<NestedItem>} [children]
 */

/**
 * Creates a nested HTML element structure using the provided data
 *
 * @param {NestedItem} item
 * @returns {HTMLElement}
 */
export function createNestedElement(item) {
	const { name, dataPath, id, children } = item
	const element = document.createElement(name)

	if (dataPath) element.dataset.path = dataPath
	if (id) element.id = id

	element.scrollIntoView = vi.fn()

	if (Array.isArray(children)) {
		children.forEach((child) => element.appendChild(createNestedElement(child)))
	}

	return element
}

/**
 * Mocks the requestSubmit function for HTMLFormElement which is not implemented by JSDOM
 */
export function mockFormRequestSubmit() {
	// eslint-disable-next-line no-undef
	HTMLFormElement.prototype.requestSubmit = vi.fn(function (submitter) {
		const event = new Event('submit', {
			bubbles: true,
			cancelable: true
		})
		if (submitter) {
			event.submitter = submitter
		}
		this.dispatchEvent(event)
	})

	return true
}

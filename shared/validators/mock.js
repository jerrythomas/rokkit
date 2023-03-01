import { vi } from 'vitest'

const original = {
	// stdout: process.stdout.write,
	stderr: process.stderr.write,
	log: console.log,
	error: console.error,
	warn: console.warn,
	info: console.info,
	debug: console.debug
}

/**
 * Mock std output and error streams.
 */
export function stdMock() {
	// process.stdout.write = vi.fn()
	process.stderr.write = vi.fn()
}

/**
 * Mock all console loggers
 */
export function consoleMock() {
	console.log = vi.fn()
	console.info = vi.fn()
	console.warn = vi.fn()
	console.error = vi.fn()
	console.debug = vi.fn()
}

export function stdMockRestore() {
	// process.stdout.write = original.stdout
	process.stderr.write = original.stderr
}
export function consoleMockRestore() {
	console.log = original.log
	console.info = original.info
	console.warn = original.warn
	console.error = original.error
	console.debug = original.debug
}

export function getCustomEventMock() {
	return vi.fn().mockImplementation((eventType, eventInit) => {
		class CustomEvent extends Event {
			constructor(type, init) {
				super(type, init)
				this.detail = init
			}
		}
		return new CustomEvent(eventType, eventInit)
	})
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

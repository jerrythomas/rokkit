export class ResizeObserver {
	constructor(callback) {
		this.callback = callback
		this.elements = new Map()
	}

	observe(element) {
		this.elements.set(element, { contentRect: element.getBoundingClientRect() })
		// Immediately invoke the callback with the initial size
		this.callback([{ target: element, contentRect: element.getBoundingClientRect() }])
	}

	unobserve(element) {
		this.elements.delete(element)
	}

	disconnect() {
		this.elements.clear()
	}

	// Simulate a resize event
	simulateResize(element, contentRect) {
		this.callback([{ target: element, contentRect }])
	}
}

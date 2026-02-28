export class IntersectionObserver {
	constructor(callback, options = {}) {
		this.callback = callback
		this.options = options
		this.elements = new Set()
	}

	observe(element) {
		this.elements.add(element)
	}

	unobserve(element) {
		this.elements.delete(element)
	}

	disconnect() {
		this.elements.clear()
	}

	// Simulate entries becoming visible
	simulateIntersection(entries) {
		this.callback(entries, this)
	}
}

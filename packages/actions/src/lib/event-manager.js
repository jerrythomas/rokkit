/**
 * EventManager class to manage event listeners on an element.
 */
export class EventManager {
	/**
	 * @param {HTMLElement} element - The target element.
	 * @param {Object} handlers - The event handlers.
	 */
	constructor(element, handlers = {}) {
		this.element = element
		this.handlers = handlers
		this.enabled = false
	}

	/**
	 * Activates the event listeners.
	 */
	activate() {
		if (!this.enabled) {
			for (const event in this.handlers) {
				this.element.addEventListener(event, this.handlers[event])
			}
			this.enabled = true
		}
	}

	/**
	 * Destroys the event listeners.
	 */
	destroy() {
		if (this.enabled) {
			for (const event in this.handlers) {
				this.element.removeEventListener(event, this.handlers[event])
			}
			this.enabled = false
		}
	}

	/**
	 * Updates the enabled state and the event handlers.
	 * @param {boolean} enabled - The new enabled state.
	 * @param {Object} handlers - The updated event handlers.
	 */
	update(enabled, handlers = this.handlers) {
		if (this.enabled !== enabled || this.handlers !== handlers) {
			this.destroy()
			this.handlers = handlers
			if (enabled) {
				this.activate()
			}
		}
	}
}

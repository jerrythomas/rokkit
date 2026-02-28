/**
 * Trigger
 *
 * Manages dropdown open/close from a trigger button.
 * Pairs with Navigator (on the dropdown) to form a complete dropdown component.
 *
 * Responsibilities:
 *   - click on trigger     → toggle open/close
 *   - Enter / Space        → toggle open/close
 *   - ArrowDown            → open (callback can focus first item)
 *   - ArrowUp              → open (callback can focus last item)
 *   - Escape (document)    → close + return focus to trigger
 *   - Click outside (doc)  → close
 *
 * Usage:
 *   const trigger = new Trigger(triggerEl, containerEl, {
 *     onopen: () => { isOpen = true },
 *     onclose: () => { isOpen = false },
 *     onlast: () => { wrapper.last(null) }  // optional: ArrowUp opens at end
 *   })
 *   // …
 *   trigger.destroy()
 */

export class Trigger {
	#trigger
	#container
	#onopen
	#onclose
	#onlast
	#isOpenFn

	/**
	 * @param {HTMLElement} trigger    — the trigger button element
	 * @param {HTMLElement} container  — the menu root (for click-outside detection)
	 * @param {{ onopen: () => void, onclose: () => void, onlast?: () => void, isOpen: () => boolean }} callbacks
	 */
	constructor(trigger, container, { onopen, onclose, onlast, isOpen }) {
		this.#trigger = trigger
		this.#container = container
		this.#onopen = onopen
		this.#onclose = onclose
		this.#onlast = onlast
		this.#isOpenFn = isOpen

		trigger.addEventListener('click', this.#handleClick)
		trigger.addEventListener('keydown', this.#handleKeydown)
		document.addEventListener('click', this.#handleDocClick, true)
		document.addEventListener('keydown', this.#handleDocKeydown)
	}

	get isOpen() { return this.#isOpenFn() }

	open() {
		if (this.isOpen) return
		this.#onopen()
	}

	close() {
		if (!this.isOpen) return
		this.#onclose()
		this.#trigger.focus()
	}

	// ─── Trigger element listeners ────────────────────────────────────────────

	#handleClick = (event) => {
		// Ignore clicks from interactive children (e.g. tag remove buttons)
		const closest = event.target.closest('button, [role="button"], a, input, select, textarea')
		if (closest && closest !== this.#trigger) return
		this.isOpen ? this.close() : this.open()
	}

	#handleKeydown = (event) => {
		const { key } = event
		if (key === 'Enter' || key === ' ') {
			event.preventDefault()
			this.isOpen ? this.close() : this.open()
		} else if (key === 'ArrowDown') {
			event.preventDefault()
			this.open()
		} else if (key === 'ArrowUp') {
			event.preventDefault()
			this.open()
			this.#onlast?.()
		}
	}

	// ─── Document-level listeners ─────────────────────────────────────────────

	#handleDocClick = (event) => {
		if (!this.isOpen) return
		if (!this.#container.contains(event.target)) this.close()
	}

	#handleDocKeydown = (event) => {
		if (!this.isOpen || event.key !== 'Escape') return
		event.preventDefault()
		this.close()
	}

	// ─── Cleanup ──────────────────────────────────────────────────────────────

	destroy() {
		this.#trigger.removeEventListener('click', this.#handleClick)
		this.#trigger.removeEventListener('keydown', this.#handleKeydown)
		document.removeEventListener('click', this.#handleDocClick, true)
		document.removeEventListener('keydown', this.#handleDocKeydown)
	}
}

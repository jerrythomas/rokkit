import { on } from 'svelte/events'
import { getClosestAncestorWithAttribute, getEventForKey } from './utils.js'
import { getPathFromKey } from '@rokkit/core'

/**
 * Key mappings for different navigation directions
 */
const KEY_MAPPINGS = {
	horizontal: {
		prev: ['ArrowLeft'],
		next: ['ArrowRight'],
		collapse: ['ArrowUp'],
		expand: ['ArrowDown'],
		select: ['Enter'],
		toggle: ['Space'],
		delete: ['Delete', 'Backspace']
	},
	vertical: {
		prev: ['ArrowUp'],
		next: ['ArrowDown'],
		collapse: ['ArrowLeft'],
		expand: ['ArrowRight'],
		select: ['Enter'],
		toggle: ['Space'],
		delete: ['Delete', 'Backspace']
	}
}

/**
 * Navigator class to handle keyboard and mouse navigation
 * @class
 */
class NavigatorController {
	/**
	 * @param {HTMLElement} root - The root element
	 * @param {Object} wrapper - The data wrapper object
	 * @param {Object} options - Configuration options
	 */
	constructor(root, wrapper, options = {}) {
		this.root = root
		this.wrapper = wrapper
		this.options = options
		this.keyMappings = KEY_MAPPINGS[options?.direction || 'vertical']

		this.handleKeyUp = this.handleKeyUp.bind(this)
		this.handleClick = this.handleClick.bind(this)
	}

	/**
	 * Initialize event listeners
	 */
	init() {
		return [on(this.root, 'keyup', this.handleKeyUp), on(this.root, 'click', this.handleClick)]
	}

	/**
	 * Check if modifier keys are pressed
	 * @param {Event} event - The event object
	 * @returns {boolean} - Whether modifier keys are pressed
	 */
	hasModifierKey(event) {
		return event.ctrlKey || event.metaKey || event.shiftKey
	}

	/**
	 * Handle keyboard events
	 * @param {KeyboardEvent} event - The keyboard event
	 */
	handleKeyUp(event) {
		const { key } = event
		const eventName = getEventForKey(this.keyMappings, key)

		if (!eventName) return

		const handled = this.processKeyAction(eventName, event)

		if (handled) {
			event.stopPropagation()
		}
	}

	/**
	 * Process a key action based on its type
	 * @param {string} eventName - The mapped event name
	 * @param {KeyboardEvent} event - The original keyboard event
	 * @returns {boolean} - Whether the event was handled
	 */
	processKeyAction(eventName, event) {
		const actionHandlers = {
			prev: () => this.handleNavigationKey('prev', this.hasModifierKey(event)),
			next: () => this.handleNavigationKey('next', this.hasModifierKey(event)),
			expand: () => this.executeAction('expand'),
			collapse: () => this.executeAction('collapse'),
			select: () => this.executeAction('select'),
			toggle: () => this.executeAction('extend'),
			delete: () => this.executeAction('delete')
		}

		const handler = actionHandlers[eventName]
		if (handler) {
			return handler() !== false
		}

		return false
	}

	/**
	 * Handle navigation key presses (arrows)
	 * @param {string} direction - The direction to move ('prev' or 'next')
	 * @param {boolean} hasModifier - Whether modifier keys are pressed
	 * @returns {boolean} - Whether the action was handled
	 */
	handleNavigationKey(direction, hasModifier) {
		// First move in the specified direction
		const moved = this.executeAction(direction)

		if (!moved) return false

		// If modifier key is pressed and multiSelect is enabled, extend selection
		if (hasModifier && this.wrapper.multiSelect) {
			this.executeAction('extend')
		} else {
			// Otherwise just select the current item
			this.executeAction('select')
		}

		// Always emit a move event for navigation
		this.emitActionEvent('move')
		return true
	}

	/**
	 * Handle click events
	 * @param {MouseEvent} event - The click event
	 */
	handleClick(event) {
		const node = getClosestAncestorWithAttribute(event.target, 'data-path')

		if (!node) return

		const path = getPathFromKey(node.getAttribute('data-path'))
		// Check if click was on a toggle icon
		const toggleIconClicked = this.handleToggleIconClick(path, event.target)

		if (toggleIconClicked) return

		// Move to the clicked item
		this.wrapper.moveTo(path)

		// Handle selection based on modifier keys
		if (this.hasModifierKey(event) && this.wrapper.multiSelect) {
			this.executeAction('extend', path)
		} else {
			this.executeAction('select', path)
		}
		this.executeAction('toggle', path)
	}

	/**
	 * Handle clicks on toggle icons
	 * @param {number[]} path - The path of the item to perform the action on
	 * @param {HTMLElement} target - The clicked element
	 * @returns {boolean} - Whether a toggle icon was clicked and handled
	 */
	handleToggleIconClick(path, target) {
		const isIcon = target.tagName.toLowerCase() === 'rk-icon'
		const state = target.getAttribute('data-state')
		if (!isIcon || !['closed', 'opened'].includes(state)) return false

		return this.executeAction('toggle', path)
	}

	/**
	 * Execute an action if available
	 * @param {string} actionName - The name of the action to execute
	 * @param {number[]} path - The path of the item to perform the action on
	 * @returns {boolean} - Whether the action was executed
	 */
	executeAction(actionName, path) {
		// Get the action function based on action name
		const action = this.getActionFunction(actionName)

		if (action) {
			const executed = path ? action(path) : action()
			if (executed) this.emitActionEvent(actionName)

			return executed
		}
		return false
	}

	/**
	 * Get the appropriate action function based on action name and conditions
	 * @param {string} actionName - The name of the action
	 * @returns {Function|null} - The action function or null if not available
	 */
	getActionFunction(actionName) {
		// Basic navigation and selection actions always available
		const actions = {
			prev: () => this.wrapper.movePrev(),
			next: () => this.wrapper.moveNext(),
			select: (path) => this.wrapper.select(path),
			collapse: (path) => this.wrapper.collapse(path),
			expand: (path) => this.wrapper.expand(path),
			toggle: (path) => this.wrapper.toggleExpansion(path),
			extend: (path) => this.wrapper.extendSelection(path),
			delete: () => this.wrapper.delete()
		}

		return actions[actionName] || null
	}

	/**
	 * Emit an action event
	 * @param {string} eventName - The name of the event to emit
	 */
	emitActionEvent(eventName) {
		const data = {
			path: this.wrapper.currentNode?.path,
			value: this.wrapper.currentNode?.value
		}

		// For select events, include selected nodes
		if (['select', 'extend'].includes(eventName)) {
			data.selected = Array.from(this.wrapper.selectedNodes.values()).map((node) => node.value)
			// Normalize selection events to 'select'
			eventName = 'select'
		}

		this.root.dispatchEvent(
			new CustomEvent('action', {
				detail: {
					eventName,
					data
				}
			})
		)
	}
}

/**
 * Navigator action for Svelte components
 * @param {HTMLElement} root - The root element
 * @param {Object} params - Parameters including wrapper and options
 */
export function navigator(root, { wrapper, options }) {
	const controller = new NavigatorController(root, wrapper, options)

	$effect(() => {
		const cleanupFunctions = controller.init()
		return () => {
			cleanupFunctions.forEach((cleanup) => cleanup())
		}
	})
}

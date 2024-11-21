import { has } from 'ramda'
import { EventManager } from './lib'

const defaultConfig = {
	allowDrag: false,
	allowDrop: false,
	pageSize: 10,
	horizontal: false,
	vertical: true,
	multiselect: false
}

/**
 * Identify modifier keys pressed in the event
 *
 * @param {KeyboardEvent} event - The keyboard event
 */
function identifyModifiers(event) {
	const modifiers = []

	if (event.ctrlKey) modifiers.push('ctrl')
	if (event.shiftKey) modifiers.push('shift')
	if (event.metaKey) modifiers.push('meta')

	return modifiers
}

/**
 * Identify if an html element is a toggle state icon
 * A toggle state icon element tag is ICON and has a data-state attribute value of 'opened' or 'closed'
 *
 * @param {HTMLElement} element - The html element to check
 */
function isToggleStateIcon(element) {
	return (
		element.tagName === 'ICON' && ['opened', 'closed'].includes(element.getAttribute('data-state'))
	)
}

/**
 * Make the current item visible in the view
 *
 * @param {HTMLElement} root - The root element which contains the items
 * @param {Object}      store - The item to make visible
 */
function scrollIntoView(root, store) {
	const item = store.currentItem()
	const dataIndex = item.indexPath.join('-')
	const node = root.querySelector(`[data-index="${dataIndex}"]`)
	if (node) node.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
}

/**
 * Get the index of the target element
 *
 * @param {MouseEvent} event - The mouse event
 */
function getTargetIndex(event) {
	const target = event.target.closest('[data-index]')
	if (target) return target.getAttribute('data-index').split('-').map(Number)

	return null
}

/**
 * Get the handler function for the drag events
 *
 * @param {Object} store    - The store object with navigation methods
 * @param {string} eventName - The name of the event to dispatch
 * @returns {Function} The event handler function
 */
function getDragEventHandler(store, eventName) {
	function handle(event) {
		const index = getTargetIndex(event)
		if (index) store[eventName](index)
	}
	return handle
}

/**
 * Handle multi-select based on the modifier keys pressed
 *
 * @param {Object}   store    - The store object with navigation methods
 * @param {number[]} index    - The index path of the item to select
 * @param {string[]} modifier - The modifier keys pressed
 */
function handleMultiSelect(store, index, modifier) {
	if (modifier.includes('shift')) {
		store.selectRange(index)
	} else if (modifier.includes('ctrl') || modifier.includes('meta')) {
		store.toggleSelection(index)
	} else {
		store.select(index)
	}
}

/**
 * Get the meta key actions for a list/tree
 *
 * @param {Object}  store      - The store object with navigation methods
 * @param {boolean} horizontal - The orientation of the list/tree
 */
function getMetaKeyActions(store, horizontal = false) {
	const actions = {
		X: () => store.cut(),
		C: () => store.copy(),
		V: () => store.paste(),
		A: () => store.selectAll(),
		D: () => store.selectNone(),
		I: () => store.selectInvert(),
		Z: () => store.undo(),
		Y: () => store.redo()
	}
	const horizontalActions = {
		ArrowRight: () => store.moveLast(),
		ArrowLeft: () => store.moveFirst()
	}
	const verticalActions = {
		ArrowUp: () => store.moveFirst(),
		ArrowDown: () => store.moveLast()
	}
	const arrowActions = horizontal ? horizontalActions : verticalActions

	return { ...actions, ...arrowActions }
}

/**
 * Get the shift key actions for a list
 *
 * @param {Object}  store      - The store object with navigation methods
 * @param {boolean} horizontal - The orientation of the list/tree
 */
function getShiftKeyActions(store, horizontal = false) {
	const actions = {
		Home: () => store.selectRange(-Infinity),
		End: () => store.selectRange(Infinity)
	}
	const horizontalActions = {
		ArrowRight: () => store.selectRange(1),
		ArrowLeft: () => store.selectRange(-1)
	}
	const verticalActions = {
		ArrowUp: () => store.selectRange(-1),
		ArrowDown: () => store.selectRange(1)
	}
	const arrowActions = horizontal ? horizontalActions : verticalActions

	return { ...actions, ...arrowActions }
}

/**
 * Get the arrow key actions for a grid
 *
 * @param {Object} store - The store object with navigation methods
 * @returns {Object}     - The map of actions
 */
function getArrowKeyActionsForGrid(store) {
	return {
		ArrowUp: () => store.moveByOffset(-1),
		ArrowDown: () => store.moveByOffset(1),
		ArrowRight: () => store.moveByOffset(0, 1),
		ArrowLeft: () => store.moveByOffset(0, -1),
		Home: () => store.moveByOffset(-Infinity, -Infinity),
		End: () => store.moveByOffset(Infinity, Infinity)
	}
}

/**
 * Get the shift key actions for a grid
 *
 * @param {Object} store - The store object with navigation methods
 * @returns {Object}     - The map of actions
 */
function getShiftKeyActionsForGrid(store) {
	return {
		ArrowUp: () => store.selectRange(-1),
		ArrowDown: () => store.selectRange(1),
		ArrowRight: () => store.selectRange(0, 1),
		ArrowLeft: () => store.selectRange(0, -1),
		Home: () => store.selectRange(0, -Infinity),
		End: () => store.selectRange(0, Infinity)
	}
}

/**
 * Get the action for the keydown event
 *
 * @param {KeyboardEvent} event    - The keyboard event
 * @param {Object}        handlers - The key handlers object
 */
function getAction(event, handlers) {
	const key = event.key.length === 1 ? event.key.toUpperCase() : event.key
	const modifier = identifyModifiers(event).join('-')
	if (modifier.length === 0) return handlers.actions[key]

	if (has(modifier, handlers.modifierActions)) {
		return handlers.modifierActions[modifier][key]
	}
	return null
}

/**
 * Get action handlers based on direction
 *
 * @param {Object} store       - The store object with navigation methods
 * @param {boolean} horizontal - if the content is navigable horizontally
 */
function getArrowKeyActions(store, horizontal = false) {
	if (horizontal) {
		return {
			ArrowUp: () => store.collapse(),
			ArrowDown: () => store.expand(),
			ArrowRight: () => store.moveByOffset(1),
			ArrowLeft: () => store.moveByOffset(-1)
		}
	} else {
		return {
			ArrowUp: () => store.moveByOffset(-1),
			ArrowDown: () => store.moveByOffset(1),
			ArrowRight: () => store.expand(),
			ArrowLeft: () => store.collapse()
		}
	}
}

/**
 * Get a map of actions for various key combinations
 *
 * @param {Object} store    - The store object with navigation methods
 * @param {number} pageSize - The number of items to move on page up/down
 */
function getKeyHandlers(store, options) {
	const { pageSize, horizontal, vertical } = options
	const isGrid = horizontal && vertical
	const arrowActions = isGrid
		? getArrowKeyActionsForGrid(store)
		: getArrowKeyActions(store, horizontal)

	const actions = {
		...arrowActions,
		PageUp: () => store.moveByOffset(-pageSize),
		PageDown: () => store.moveByOffset(pageSize),
		Home: () => store.moveFirst(),
		End: () => store.moveLast(),
		Enter: () => store.select(),
		Escape: () => store.escape(),
		' ': () => store.select()
	}

	const modifierActions = {
		ctrl: getMetaKeyActions(store, horizontal),
		meta: getMetaKeyActions(store, horizontal),
		shift: isGrid ? getShiftKeyActionsForGrid(store) : getShiftKeyActions(store, horizontal)
	}

	return { actions, modifierActions }
}
/**
 * Get the keydown event handler
 *
 * @param {Object}      store   - The store object with navigation methods
 * @param {Object}      options - The configuration options
 * @param {HTMLElement} root    - The root element to add the event listener to
 */
function getKeydownHandler(store, options, root) {
	const handlers = getKeyHandlers(store, options)

	/**
	 * Use the keyboard event map to handle the keydown event
	 *
	 * @param {KeyboardEvent} event - The keyboard event
	 */
	function handleKeydown(event) {
		const action = getAction(event, handlers)
		if (action) {
			event.preventDefault()
			action()
			scrollIntoView(root, store)
			// dispatchEvents(root, store)
		}
	}

	return handleKeydown
}
/**
 * Get the handler function for the keydown event
 *
 * @param {Object}      store   - The store object with navigation methods
 * @param {Object}      options - The configuration options
 */
function getClickHandler(store, options) {
	const { multiselect = false } = options

	function handleClick(event) {
		const modifiers = identifyModifiers(event)
		const indexPath = getTargetIndex(event)

		if (!indexPath) return
		event.stopPropagation()

		if (isToggleStateIcon(event.target)) {
			store.toggleExpansion(indexPath)
		} else {
			if (multiselect) {
				handleMultiSelect(store, indexPath, modifiers)
			} else {
				store.moveTo(indexPath)
				store.select(indexPath)
			}
		}
		// dispatchEvents(event.target, store)
	}

	return handleClick
}

/**
 * Update the event handlers based on the configuration
 *
 * @param {HTMLElement} root    - The DOM root node to add the action to
 * @param {Object} manager - The event manager object
 * @param {Object} config - The configuration object
 */
function updateEventHandlers(root, manager, config) {
	const store = config.store
	const options = { ...defaultConfig, ...config.options }

	const listeners = {
		keydown: getKeydownHandler(store, options, root),
		click: getClickHandler(store, options)
	}
	if (options.allowDrag) listeners.dragstart = getDragEventHandler(store, 'dragStart')
	if (options.allowDrop) {
		listeners.dragover = getDragEventHandler(store, 'dragOver')
		listeners.drop = getDragEventHandler(store, 'dropOver')
	}
	manager.update(listeners)
}

/**
 * A svelte action to add keyboard navigation to a list/tree/grid
 *
 * @param {HTMLElement} root   - The DOM root node to add the action to
 * @param {Object}      config - The configuration object
 * @param {Object}      config.store  - The store object with navigation methods
 * @param {Object}      config.options - The configuration options
 * @param {number}      config.options.pageSize   - The number of items to move on page up/down
 * @param {boolean}     config.options.horizontal - The orientation of the list/tree
 * @param {boolean}     config.options.vertical   - The orientation of the list/tree
 */
export function traversable(root, config) {
	const manager = EventManager(root, {})
	const events = config.store.events

	$effect(() => {
		const unsubscribe = events.subscribe((data) => {
			if (data.length > 0) {
				data.forEach(({ type, detail }) => root.dispatchEvent(new CustomEvent(type, { detail })))
				events.set([])
			}
		})

		updateEventHandlers(root, manager, config)

		return () => {
			unsubscribe()
			manager.reset()
		}
	})

	// return {
	// 	destroy: () => {
	// 		// console.log(typeof unsubscribe)
	// 		unsubscribe()
	// 		manager.reset()
	// 	},
	// 	update: (newConfig) => updateEventHandlers(root, manager, newConfig)
	// }
}

import { on } from 'svelte/events'
import { getClosestAncestorWithAttribute, getEventForKey } from './utils.js'
import { getPathFromKey } from '@rokkit/core'

const Horizontal = {
	prev: ['ArrowLeft'],
	next: ['ArrowRight'],
	collapse: ['ArrowUp'],
	expand: ['ArrowDown'],
	select: ['Enter']
}

const Vertical = {
	prev: ['ArrowUp'],
	next: ['ArrowDown'],
	collapse: ['ArrowLeft'],
	expand: ['ArrowRight'],
	select: ['Enter']
}

/**
 * Dispatches an action event on the root element
 *
 * @param {string} eventName
 * @param {import('./types.js').DataWrapper} wrapper
 * @param {HTMLElement} root
 */
function emitAction(eventName, wrapper, root) {
	const data = {
		path: wrapper.currentNode?.path,
		value: wrapper.currentNode?.value
	}
	if (eventName === 'select') {
		data.selected = wrapper.selectedNodes.values().map((node) => node.value)
	}
	root.dispatchEvent(
		new CustomEvent('action', {
			eventName,
			data
		})
	)
}

/**
 * Get actions for the navigator
 *
 * @param {import('./types.js').DataWrapper} wrapper - The navigator wrapper
 * @param {HTMLElement} root - The root element
 * @returns {import('./types.js').NavigatorActions} - The navigator actions
 */
function getActions(wrapper) {
	const actions = {
		prev: () => wrapper.movePrev(),
		next: () => wrapper.moveNext(),
		select: () => wrapper.select(),
		extend: () => wrapper.extendSelection(),
		collapse: () => wrapper.collapse(),
		expand: () => wrapper.expand(),
		toggle: () => wrapper.toggleSelection()
	}
	return actions
}

function handleIconClick(target, wrapper) {
	const isIcon = target.tagName.toLowerCase() === 'rk-icon'
	const state = isIcon ? target.getAttribute('data-state') : null

	if (state === 'closed') {
		wrapper.expand()
	} else if (state === 'opened') {
		wrapper.collapse()
	}
	return ['closed', 'opened'].includes(state)
}

function performAction(actions, actionName, wrapper, root) {
	if (actions[actionName]) {
		const executed = actions[actionName]()
		if (executed) emitAction(actionName, wrapper, root)
	}
}

/**
 * Handle keyboard events
 *
 * @param {HTMLElement} root
 * @param {import('./types.js').NavigatorConfig} options - Custom key mappings
 */
export function navigator(root, { wrapper, options }) {
	const keyMappings = options?.direction === 'horizontal' ? Horizontal : Vertical
	const actions = getActions(wrapper, root)

	/**
	 * Handle keyboard events
	 *
	 * @param {KeyboardEvent} event
	 */
	const keyup = (event) => {
		const { key } = event
		// let result = false

		const eventName = getEventForKey(keyMappings, key)
		performAction(actions, eventName, wrapper, root)
		// if (eventName) result = actions[eventName]()
		// if (result) emitAction(eventName, wrapper, root)
	}

	const click = (event) => {
		const node = getClosestAncestorWithAttribute(event.target, 'data-path')

		if (node) {
			const iconClicked = handleIconClick(event.target, wrapper)
			const path = getPathFromKey(node.getAttribute('data-path'))

			const selected = wrapper.select(path, event.ctrlKey || event.metaKey)
			if (selected) {
				root.dispatchEvent(new CustomEvent('activate'))
			}
			if (!iconClicked) wrapper.toggleExpansion()
			emitAction('click', wrapper, root)
		}
	}

	$effect(() => {
		const cleanupKeyupEvent = on(root, 'keyup', keyup)
		const cleanupClickEvent = on(root, 'click', click)
		return () => {
			cleanupKeyupEvent()
			cleanupClickEvent()
		}
	})
}

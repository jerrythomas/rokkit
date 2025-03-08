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
 * Get actions for the navigator
 *
 * @param {import('./types.js').DataWrapper} wrapper - The navigator wrapper
 * @returns {import('./types.js').NavigatorActions} - The navigator actions
 */
function getActions(wrapper) {
	const actions = {
		prev: () => wrapper.movePrev(),
		next: () => wrapper.moveNext(),
		select: () => wrapper.select(),
		collapse: () => wrapper.collapse?.(),
		expand: () => wrapper.expand?.()
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

/**
 * Handle keyboard events
 *
 * @param {HTMLElement} root
 * @param {import('./types.js').NavigatorConfig} options - Custom key mappings
 */
export function navigator(root, { wrapper, options }) {
	const keyMappings = options?.direction === 'horizontal' ? Horizontal : Vertical
	const actions = getActions(wrapper)

	/**
	 * Handle keyboard events
	 *
	 * @param {KeyboardEvent} event
	 */
	const keyup = (event) => {
		const { key } = event

		const eventName = getEventForKey(keyMappings, key)
		if (eventName) {
			actions[eventName]()
		}
	}

	const click = (event) => {
		const node = getClosestAncestorWithAttribute(event.target, 'data-path')

		if (node) {
			const iconClicked = handleIconClick(event.target, wrapper)
			const path = getPathFromKey(node.getAttribute('data-path'))
			wrapper.select(path, event.ctrlKey || event.metaKey)
			if (!iconClicked) wrapper.toggleExpansion()
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

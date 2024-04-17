import { handleAction } from './utils'
import { isNested, hasChildren, isExpanded } from '@rokkit/core'
import {
	moveNext,
	movePrevious,
	pathFromIndices,
	indicesFromPath,
	getCurrentNode
} from './hierarchy'
import { mapKeyboardEventsToActions } from './lib'
/**
 * Keyboard navigation for Lists and NestedLists. The data is either nested or not and is not
 * expected to switch from nested to simple list or vice-versa.
 *
 * @param {HTMLElement}                        element - Root element for the actionn
 * @param {import('./types').NavigatorOptions} options - Configuration options for the action
 * @returns
 */
export function navigator(element, options) {
	const { fields, enabled = true, vertical = true, idPrefix = 'id-' } = options
	let items, path, currentNode

	if (!enabled) return { destroy: () => {} }

	// todo: Update should handle selection value change
	// should we wait a tick before updating?
	const update = (input) => {
		const previousNode = currentNode
		items = input.items
		path = pathFromIndices(input.indices ?? [], items, fields)
		currentNode = getCurrentNode(path)

		if (previousNode !== currentNode && currentNode) {
			const indices = indicesFromPath(path)
			let current = element.querySelector(`#${idPrefix}${indices.join('-')}`)
			if (current) {
				current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
			}
		}
	}

	const next = () => {
		const previousNode = currentNode
		path = moveNext(path, items, fields)
		currentNode = getCurrentNode(path)
		if (previousNode !== currentNode) moveTo(element, path, currentNode, idPrefix)
	}

	const previous = () => {
		const previousNode = currentNode
		path = movePrevious(path)
		if (path.length > 0) {
			currentNode = getCurrentNode(path)
			if (previousNode !== currentNode) moveTo(element, path, currentNode, idPrefix)
		}
	}
	const select = () => {
		if (currentNode) emit('select', element, indicesFromPath(path), currentNode)
	}
	const collapse = () => {
		if (currentNode) {
			const expanded = isExpanded(currentNode, path[path.length - 1].fields)
			if (expanded) {
				toggle()
			} else if (path.length > 0) {
				path = path.slice(0, -1)
				currentNode = getCurrentNode(path)
				select()
			}
		}
	}
	const expand = () => {
		if (currentNode && hasChildren(currentNode, path[path.length - 1].fields)) {
			toggle()
		}
	}
	function toggle() {
		const expanded = isExpanded(currentNode, path[path.length - 1].fields)
		const event = expanded ? 'collapse' : 'expand'
		currentNode[path[path.length - 1].fields.isOpen] = !expanded
		emit(event, element, indicesFromPath(path), currentNode)
	}
	const handlers = { next, previous, select, collapse, expand }

	update(options)

	const nested = isNested(items, fields)
	const actions = mapKeyboardEventsToActions(handlers, {
		horizontal: !vertical,
		nested
	})

	const handleKeyDown = (event) => handleAction(actions, event)

	const handleClick = (event) => {
		event.stopPropagation()
		const target = findParentWithDataPath(event.target, element)
		const indices = !target
			? []
			: target.dataset.path
					.split(',')
					.filter((item) => item !== '')
					.map((item) => Number(item))

		if (indices.length > 0 && event.target.tagName !== 'DETAIL') {
			path = pathFromIndices(indices, items, fields)
			currentNode = getCurrentNode(path)
			if (hasChildren(currentNode, path[path.length - 1].fields)) {
				currentNode[path[path.length - 1].fields.isOpen] =
					!currentNode[path[path.length - 1].fields.isOpen]
				const eventName = currentNode[path[path.length - 1].fields.isOpen] ? 'expand' : 'collapse'
				emit(eventName, element, indices, currentNode)
			} else if (currentNode !== null) emit('select', element, indices, currentNode)
			emit('move', element, indices, currentNode)
			// emit('select', element, indices, currentNode)
		}
	}

	element.addEventListener('keydown', handleKeyDown)
	element.addEventListener('click', handleClick)

	return {
		update,
		destroy() {
			element.removeEventListener('keydown', handleKeyDown)
			element.removeEventListener('click', handleClick)
		}
	}
}

/**
 * Move to the element with the given path
 *
 * @param {HTMLElement} element
 * @param {*} path
 * @param {*} currentNode
 * @param {*} idPrefix
 */
export function moveTo(element, path, currentNode, idPrefix) {
	const indices = indicesFromPath(path)
	const current = element.querySelector(`#${idPrefix}${indices.join('-')}`)
	if (current) current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })

	emit('move', element, indices, currentNode)
}

/**
 * Find the parent element with data-path attribute
 *
 * @param {HTMLElement} element
 * @param {HTMLElement} root
 * @returns {HTMLElement}
 */
export function findParentWithDataPath(element, root) {
	if (element.hasAttribute('data-path')) return element
	let parent = element.parentNode

	while (parent && parent !== root && !parent.hasAttribute('data-path')) {
		parent = parent.parentNode
	}

	return parent !== root ? parent : null
}

/**
 * Emit a custom event on the element with the path and node as detail
 *
 * @param {string} event
 * @param {HTMLElement} element
 * @param {Array<integer>} indices
 * @param {*} node
 */
function emit(event, element, indices, node) {
	element.dispatchEvent(
		new CustomEvent(event, {
			detail: {
				path: indices,
				node: node
			}
		})
	)
}

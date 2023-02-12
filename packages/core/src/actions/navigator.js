import {
	moveNext,
	movePrevious,
	isNested,
	hasChildren,
	pathFromIndices,
	getCurrentNode
} from './hierarchy'
/**
 * @typedef NavigatorOptions
 * @property {Array<*>}     items           - An array containing the data set to navigate
 * @property {boolean}      [vertical=true] - Identifies whether navigation shoud be vertical or horizontal
 * @property {import('../constants').FieldMapping} fields - Field mapping to identify attributes to be used for state and identification of children
 */

/**
 * Keyboard navigation for Lists and NestedLists
 *
 * @param {HTMLElement}      node    - The node on which the action is to be used on
 * @param {NavigatorOptions} options - Configuration options for the action
 * @returns
 */
export function navigator(node, options) {
	let { items, fields, vertical = true } = options
	const nested = isNested(items, fields)

	let path = pathFromIndices(options.indices ?? [], items, fields)
	let currentNode = getCurrentNode(path)

	const next = () => {
		const previousNode = currentNode
		path = moveNext(path, items, fields)
		currentNode = getCurrentNode(path)

		if (previousNode !== currentNode)
			node.dispatchEvent(new CustomEvent('move', { node: currentNode }))
	}
	const previous = () => {
		const previousNode = currentNode
		path = movePrevious(path)
		if (path.length > 0) {
			currentNode = getCurrentNode(path)
			if (previousNode !== currentNode)
				node.dispatchEvent(new CustomEvent('move', { node: currentNode }))
		}
	}
	const select = () => {
		if (currentNode)
			node.dispatchEvent(new CustomEvent('select', { node: currentNode }))
	}
	const collapse = () => {
		if (hasChildren(currentNode, path[path.length - 1].fields))
			node.dispatchEvent(new CustomEvent('collapse', { node: currentNode }))
	}
	const expand = () => {
		if (hasChildren(currentNode, path[path.length - 1].fields))
			node.dispatchEvent(new CustomEvent('expand', { node: currentNode }))
	}

	const movement = vertical
		? { ArrowDown: next, ArrowUp: previous }
		: { ArrowRight: next, ArrowLeft: previous }
	const states = !nested
		? {}
		: vertical
		? { ArrowRight: expand, ArrowLeft: collapse }
		: { ArrowDown: expand, ArrowUp: collapse }
	const actions = { ...movement, Enter: select, ...states }

	const handleKeyDown = (event) => {
		if (actions[event.key]) {
			event.preventDefault()
			event.stopPropagation()
			actions[event.key]()
		}
	}
	node.addEventListener('keydown', handleKeyDown)

	return {
		update: (options) => {
			items = options.items
			path = pathFromIndices(options.indices ?? [])
		},
		destroy() {
			node.removeEventListener('keydown', handleKeyDown)
		}
	}
}

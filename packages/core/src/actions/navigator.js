import {
	moveNext,
	movePrevious,
	isNested,
	hasChildren,
	pathFromIndices,
	indicesFromPath,
	getCurrentNode
} from './hierarchy'
/**
 * @typedef NavigatorOptions
 * @property {Array<*>}     items           - An array containing the data set to navigate
 * @property {boolean}      [vertical=true] - Identifies whether navigation shoud be vertical or horizontal
 * @property {string}       [idPrefix='id-'] - id prefix used for identifying individual node
 * @property {import('../constants').FieldMapping} fields - Field mapping to identify attributes to be used for state and identification of children
 */

/**
 * Keyboard navigation for Lists and NestedLists. The data is either nested or not and is not
 * expected to switch from nested to simple list or vice-versa.
 *
 * @param {HTMLElement}      node    - The node on which the action is to be used on
 * @param {NavigatorOptions} options - Configuration options for the action
 * @returns
 */
export function navigator(node, options) {
	const { fields, enabled = true, vertical = true, idPrefix = 'id-' } = options
	let items, path, currentNode

	if (!enabled) return { destroy: () => {} }

	const update = (options) => {
		items = options.items
		path = pathFromIndices(options.indices ?? [], items, fields)
		currentNode = getCurrentNode(path)
	}

	const next = () => {
		const previousNode = currentNode
		path = moveNext(path, items, fields)
		currentNode = getCurrentNode(path)

		if (previousNode !== currentNode) moveTo(node, path, currentNode, idPrefix)
	}
	const previous = () => {
		const previousNode = currentNode
		path = movePrevious(path)
		if (path.length > 0) {
			currentNode = getCurrentNode(path)
			if (previousNode !== currentNode)
				moveTo(node, path, currentNode, idPrefix)
		}
	}
	const select = () => {
		if (currentNode)
			node.dispatchEvent(
				new CustomEvent('select', {
					detail: { path: indicesFromPath(path), node: currentNode }
				})
			)
	}
	const collapse = () => {
		if (currentNode && hasChildren(currentNode, path[path.length - 1].fields)) {
			currentNode[path[path.length - 1].fields.isOpen] = false
			node.dispatchEvent(
				new CustomEvent('collapse', {
					detail: { path: indicesFromPath(path), node: currentNode }
				})
			)
		}
	}
	const expand = () => {
		if (currentNode && hasChildren(currentNode, path[path.length - 1].fields)) {
			currentNode[path[path.length - 1].fields.isOpen] = true
			node.dispatchEvent(
				new CustomEvent('expand', {
					detail: { path: indicesFromPath(path), node: currentNode }
				})
			)
		}
	}

	update(options)

	const nested = isNested(items, fields)
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

	const handleClick = (event) => {
		let target = findParentWithDataPath(event.target)
		let indices = !target
			? []
			: target.dataset.path
					.split(',')
					.filter((item) => item !== '')
					.map((item) => +item)

		if (indices.length > 0) {
			path = pathFromIndices(indices, items, fields)
			currentNode = getCurrentNode(path)
			node.dispatchEvent(
				new CustomEvent('select', {
					detail: { path: indices, node: currentNode }
				})
			)
		}
	}

	node.addEventListener('keydown', handleKeyDown)
	node.addEventListener('click', handleClick)

	return {
		update,
		destroy() {
			node.removeEventListener('keydown', handleKeyDown)
			node.removeEventListener('click', handleClick)
		}
	}
}

export function moveTo(node, path, currentNode, idPrefix) {
	const indices = indicesFromPath(path)

	let current = node.querySelector('#' + idPrefix + indices.join('-'))
	if (current) current.scrollIntoView({ behavior: 'auto' })

	node.dispatchEvent(
		new CustomEvent('move', {
			detail: { path: indices, node: currentNode }
		})
	)
}

export function findParentWithDataPath(element) {
	// console.log(element, element.attributes)
	if (element.hasAttribute('data-path')) return element

	let parent = element.parentNode
	while (parent && !parent.hasAttribute('data-path')) {
		parent = parent.parentNode
	}

	return parent
}

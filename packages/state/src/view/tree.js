import { omit, pick } from 'ramda'

export function getNode(item, index, path = []) {
	const isParent = Array.isArray(item.children) && item.children.length > 0
	const indexPath = [...path, index]
	const node = {
		depth: path.length,
		isParent,
		indexPath,
		value: item,
		children: []
	}
	if (Array.isArray(item.children)) {
		item.children.forEach((child, pos) =>
			node.children.push({
				...getNode(child, pos, indexPath),
				parent: node
			})
		)
	}

	return node
}

export function flattenNodes(nodes) {
	let data = []
	nodes.forEach((node) => {
		// data.push(node)
		data = [...data, node, ...flattenNodes(node.children)]
		// flattenNodes(node.children, data)
	})
	return data
}

export function getTree(items, path = []) {
	const data = items.map((item, index) => getNode(item, index, path))
	// console.log(data)
	return flattenNodes(data)
}

export function serializeNodesUsingIndex(tree) {
	return tree.map((node) => {
		const parent = node.parent ? node.parent.indexPath : null
		const children = serializeNodesUsingIndex(node.children)
		return { ...omit(['parent', 'children'], node), parent, children }
	})
}

export function getNestedAttributes(tree, attributes) {
	return tree.map((node) => ({
		...pick(attributes, node),
		children: getNestedAttributes(node.children, attributes)
	}))
}

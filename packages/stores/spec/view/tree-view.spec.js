import { describe, it, expect } from 'vitest'
// import { createView } from '../../src/view'
import { omit } from 'ramda'

describe('view for tree', () => {
	const items = [
		{ name: 'Smith', children: [{ name: 'John' }, { name: 'Jane' }] },
		{
			name: 'Hunt',
			children: [
				{
					name: 'Ethan',
					children: [{ name: 'Alice' }, { name: 'Eve' }]
				},
				{ name: 'Emma' }
			]
		}
	]
	function getNode(item, index, path = []) {
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
	function flattenNodes(nodes) {
		let data = []
		nodes.forEach((node) => {
			// data.push(node)
			data = [...data, node, ...flattenNodes(node.children)]
			// flattenNodes(node.children, data)
		})
		return data
	}
	function getTree(items, path = []) {
		const data = items.map((item, index) => getNode(item, index, path))
		// console.log(data)
		return flattenNodes(data)
	}

	function serializeNodesUsingIndex(tree) {
		return tree.map((node) => {
			const parent = node.parent ? node.parent.indexPath : null
			const children = serializeNodesUsingIndex(node.children)
			return { ...omit(['parent', 'children'], node), parent, children }
		})
	}

	const tree = [
		{ depth: 0, children: [], isParent: true, indexPath: [0], value: items[0] },
		{ depth: 1, children: [], isParent: false, indexPath: [0, 0], value: items[0].children[0] },
		{ depth: 1, children: [], isParent: false, indexPath: [0, 1], value: items[0].children[1] },
		{ depth: 0, children: [], isParent: true, indexPath: [1], value: items[1] },
		{ depth: 1, children: [], isParent: true, indexPath: [1, 0], value: items[1].children[0] },
		{
			depth: 2,
			children: [],
			isParent: false,
			indexPath: [1, 0, 0],
			value: items[1].children[0].children[0]
		},
		{
			depth: 2,
			children: [],
			isParent: false,
			indexPath: [1, 0, 1],
			value: items[1].children[0].children[1]
		},
		{ depth: 1, children: [], isParent: false, indexPath: [1, 1], value: items[1].children[1] }
	]
	tree[1].parent = tree[0]
	tree[2].parent = tree[0]
	tree[4].parent = tree[3]
	tree[5].parent = tree[4]
	tree[6].parent = tree[4]
	tree[7].parent = tree[3]

	tree[0].children = [tree[1], tree[2]]
	tree[4].children = [tree[5], tree[6]]
	tree[3].children = [tree[4], tree[7]]

	it('should generate a flat tree from input', () => {
		const result = getTree(items)
		expect(result.length).toEqual(8)
		expect(serializeNodesUsingIndex(result)).toEqual(serializeNodesUsingIndex(tree))
	})
	// it('should not change state on expand', () => {
	// 	const view = createView(items)

	// 	view.expand(1)
	// 	// const expected = clone(getList(items))
	// 	// expected[1].isExpanded = true
	// 	expect(get(view)).toEqual({
	// 		data: getList(items),
	// 		fields: undefined,
	// 		value: 'a',
	// 		currentIndex: 0,
	// 		selectedItems: []
	// 	})
	// })

	// it('should not change state on collapse', () => {
	// 	const items = ['a', 'b', 'c']
	// 	const view = createView(items)

	// 	view.expand(1)
	// 	view.collapse(1)
	// 	// const expected = clone(getList(items))
	// 	// expected[1].isExpanded = false
	// 	expect(get(view)).toEqual({
	// 		data: getList(items),
	// 		fields: undefined,
	// 		value: 'a',
	// 		currentIndex: 0,
	// 		selectedItems: []
	// 	})
	// })

	// it('should not change state on toggle expansion', () => {
	// 	const items = ['a', 'b', 'c']
	// 	const view = createView(items)

	// 	view.toggleExpansion(1)
	// 	const expected = clone(getList(items))
	// 	// expected[1].isExpanded = true
	// 	expect(get(view)).toEqual({
	// 		data: expected,
	// 		fields: undefined,
	// 		value: 'a',
	// 		currentIndex: 0,
	// 		selectedItems: []
	// 	})
	// 	view.toggleExpansion(1)
	// 	// expected[1].isExpanded = false
	// 	expect(get(view)).toEqual({
	// 		data: expected,
	// 		fields: undefined,
	// 		value: 'a',
	// 		currentIndex: 0,
	// 		selectedItems: []
	// 	})
	// })

	// it('should not change state on expandAll', () => {
	// 	const items = ['a', 'b', 'c']
	// 	const view = createView(items)

	// 	view.expandAll()
	// 	expect(get(view)).toEqual({
	// 		data: getList(items), //.map((item) => ({ ...item, isExpanded: true })),
	// 		fields: undefined,
	// 		value: 'a',
	// 		currentIndex: 0,
	// 		selectedItems: []
	// 	})
	// })

	// it('should not change state on collapseAll', () => {
	// 	const items = ['a', 'b', 'c']
	// 	const view = createView(items)

	// 	view.expandAll()
	// 	view.collapseAll()
	// 	expect(get(view)).toEqual({
	// 		data: getList(items), //.map((item) => ({ ...item, isExpanded: false })),
	// 		fields: undefined,
	// 		value: 'a',
	// 		currentIndex: 0,
	// 		selectedItems: []
	// 	})
	// })
})

function addNode(items, parent) {
	const indices = parent.getAttribute('data-index') ?? ''
	const path = indices.split('-').map(Number)

	items.forEach((item, index) => {
		const node = document.createElement('node')
		const text = document.createElement('p')
		node.setAttribute('data-index', [...path, index].join('-'))
		node.scrollIntoView = vi.fn()
		text.textContent = item.text
		if (Array.isArray(item.children)) {
			const icon = document.createElement('icon')
			icon.setAttribute('data-state', 'opened')
			node.appendChild(icon)
			addNode(item.children, node)
		}
		node.appendChild(text)
		parent.appendChild(node)
	})
}

export function createTree(items) {
	const root = document.createElement('div')
	addNode(items, root)
	return root
}

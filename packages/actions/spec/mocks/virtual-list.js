import { vi } from 'vitest'

// const globalConfig = {
// 	viewport: {
// 		offsetHeight: 500,
// 		offsetWidth: 500
// 	}
// }

const defaultConfig = {
	numberOfItems: 5,
	start: 0,
	viewportTag: 'virtual-list-viewport',
	contentsTag: 'virtual-list-contents',
	itemTag: 'virtual-list-item'
}

const properties = {
	paddingTop: '0px',
	paddingBottom: '0px',
	paddingLeft: '0px',
	paddingRight: '0px',
	height: '200px',
	width: '200px',
	scrollTop: '0px'
}

const propertySpy = (name) => ({
	set: vi.fn().mockImplementation((v) => (properties[name] = v)),
	get: () => properties[name]
})

export function mockVirtualList(config) {
	const { numberOfItems, start, viewportTag, contentsTag, itemTag } = {
		...defaultConfig,
		...config
	}
	const viewport = document.createElement(viewportTag)
	const contents = document.createElement(contentsTag)
	viewport.scrollTo = vi.fn().mockImplementation((x, y) => {
		// console.log('setting scrollTop', x + y)
		viewport.scrollTop = x + y
	})
	viewport.appendChild(contents)

	// Spy on padding setters for contents
	Object.defineProperty(contents.style, 'paddingTop', propertySpy('paddingTop'))
	Object.defineProperty(contents.style, 'paddingBottom', propertySpy('paddingBottom'))
	Object.defineProperty(contents.style, 'paddingLeft', propertySpy('paddingLeft'))
	Object.defineProperty(contents.style, 'paddingRight', propertySpy('paddingright'))

	// Spy on height and width setters for viewport
	Object.defineProperty(viewport.style, 'height', propertySpy('height'))
	Object.defineProperty(viewport.style, 'width', propertySpy('width'))

	// Mock getters for offsetHeight and offsetWidth on viewport
	Object.defineProperty(viewport, 'offsetHeight', {
		get: () => Number(properties.height.replace('px', ''))
	})
	Object.defineProperty(viewport, 'offsetWidth', {
		get: () => Number(properties.width.replace('px', ''))
	})

	for (let i = 0; i < numberOfItems; i++) {
		const item = document.createElement(itemTag)
		item.textContent = i + start
		item.setAttribute('data-path', i + start)
		Object.defineProperty(item, 'offsetWidth', {
			get: () => 100
		})
		Object.defineProperty(item, 'offsetHeight', {
			get: () => 40
		})
		contents.appendChild(item)
	}

	return {
		viewport,
		contents,
		properties
	}
}

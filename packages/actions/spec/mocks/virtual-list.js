import { vi } from 'vitest'

const globalConfig = {
	viewport: {
		offsetHeight: 500,
		offsetWidth: 500
	}
}

const defaultConfig = {
	numberOfItems: 5,
	start: 0,
	viewportTag: 'virtual-list-viewport',
	contentsTag: 'virtual-list-contents',
	itemTag: 'virtual-list-item'
}

export function mockVirtualList(config) {
	const { numberOfItems, start, viewportTag, contentsTag, itemTag } = {
		...defaultConfig,
		...config
	}
	const viewport = document.createElement(viewportTag)
	const contents = document.createElement(contentsTag)
	contents.scrollTo = vi.fn().mockImplementation((x, y) => {
		contents.scrollTop = x + y
	})
	viewport.appendChild(contents)

	let paddingSpy = { set: vi.fn(), get: () => '10px' }
	let heightSpy = { set: vi.fn(), get: () => '100px' }
	let widthSpy = { set: vi.fn(), get: () => '100px' }

	// Spy on padding setters for contents
	Object.defineProperty(contents.style, 'paddingTop', paddingSpy)
	Object.defineProperty(contents.style, 'paddingBottom', paddingSpy)
	Object.defineProperty(contents.style, 'paddingLeft', paddingSpy)
	Object.defineProperty(contents.style, 'paddingRight', paddingSpy)

	// Spy on height and width setters for viewport
	Object.defineProperty(viewport.style, 'height', heightSpy)
	Object.defineProperty(viewport.style, 'width', widthSpy)

	// Mock getters for offsetHeight and offsetWidth on viewport
	Object.defineProperty(viewport, 'offsetHeight', {
		get: () => globalConfig.viewport.offsetHeight
	})
	Object.defineProperty(viewport, 'offsetWidth', {
		get: () => globalConfig.viewport.offsetWidth
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
		paddingSpy,
		heightSpy,
		widthSpy,
		config: globalConfig
	}
}

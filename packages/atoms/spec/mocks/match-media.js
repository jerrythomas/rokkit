import { vi } from 'vitest'
function parseMediaQuery(mediaQuery) {
	const regex = /\(([^:]+):\s*([^)]+)\)/g
	const result = {}

	let match
	while ((match = regex.exec(mediaQuery)) !== null) {
		const [, property, value] = match
		result[property.trim()] = parseInt(value.trim(), 10)
	}

	return result
}
function evaluateMediaQuery(mediaQuery, width) {
	for (const property in mediaQuery) {
		const value = mediaQuery[property]

		if (property === 'min-width' && width < value) {
			return false
		}

		if (property === 'max-width' && width > value) {
			return false
		}
	}

	return true
}

let watchMediaQueries = []
let listeners = []

export const matchMediaMock = vi.fn().mockImplementation((query) => {
	const mediaQuery = parseMediaQuery(query)
	const handler = (width) => evaluateMediaQuery(mediaQuery, width)

	const queryObject = {
		media: query,
		matches: handler(window.innerWidth),
		addListener: vi
			.fn()
			.mockImplementation((listener) => listeners.push(listener)),
		removeListener: vi
			.fn()
			.mockImplementation((listener) =>
				listeners.splice(listeners.indexOf(listener), 1)
			),
		handler
	}
	watchMediaQueries.push(queryObject)
	return watchMediaQueries[watchMediaQueries.length - 1]
})

export function updateMedia() {
	watchMediaQueries.forEach((query) => {
		query.matches = query.handler(window.innerWidth)
	})
	listeners.forEach((listener) => listener())
}

import { vi } from 'vitest'

const watchMediaQueries = []
const listeners = []

/**
 * @typedef {Object} MediaQuery
 * @property {integer} [min-width]
 * @property {integer} [max-width]
 * @property {integer} [min-height]
 * @property {integer} [max-height]
 * @property {integer} [width]
 * @property {integer} [height]
 * @property {integer} [orientation]
 * @property {integer} [aspect-ratio]
 * @property {integer} [min-aspect-ratio]
 * @property {integer} [max-aspect-ratio]
 * @property {integer} [resolution]
 * @property {integer} [min-resolution]
 * @property {integer} [max-resolution]
 * @property {integer} [scan]
 * @property {integer} [grid]
 * @property {integer} [update]
 * @property {integer} [overflow-block]
 */

/**
 * Parses a media query string into an object
 *
 * @param {string} mediaQuery
 * @returns {MediaQuery}
 */
function parseMediaQuery(mediaQuery) {
	const regex = /\(([^:]+):\s*([^)]+)\)/g
	const result = {}

	let match = null
	while ((match = regex.exec(mediaQuery)) !== null) {
		const [, property, value] = match
		result[property.trim()] = parseInt(value.trim(), 10)
	}

	return result
}

/**
 * Simulates the evaluation of a media query
 *
 * @param {MediaQuery} mediaQuery
 * @param {integer} width
 * @returns
 */
function evaluateMediaQuery(mediaQuery, width) {
	const { 'min-width': minWidth = 0, 'max-width': maxWidth = width } = mediaQuery

	return width >= minWidth && width <= maxWidth
}

/**
 * Mocks the window.matchMedia function
 * @param {string} query
 * @returns {Object}
 */
export const matchMediaMock = vi.fn().mockImplementation((query) => {
	const mediaQuery = parseMediaQuery(query)
	const handler = (width) => evaluateMediaQuery(mediaQuery, width)

	const queryObject = {
		media: query,
		matches: handler(window.innerWidth),
		addListener: vi.fn().mockImplementation((listener) => listeners.push(listener)),
		removeListener: vi
			.fn()
			.mockImplementation((listener) => listeners.splice(listeners.indexOf(listener), 1)),
		handler
	}
	watchMediaQueries.push(queryObject)
	return watchMediaQueries[watchMediaQueries.length - 1]
})

/**
 * Updates the media query matches
 * @returns {void}
 */
export function updateMedia() {
	watchMediaQueries.forEach((query) => {
		query.matches = query.handler(window.innerWidth)
	})
	listeners.forEach((listener) => listener())
}

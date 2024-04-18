/**
 * Taken from https://github.com/cibernox/svelte-media and converted to esm with jsdoc.
 */
import { writable } from 'svelte/store'

const defaultBreakpoints = {
	small: '(max-width: 767px)',
	medium: '(min-width: 768px) and (max-width: 1023px)',
	large: '(min-width: 1024px)',
	extraLarge: '(min-width: 1280px)',
	short: '(max-height: 399px)',
	landscape: '(orientation: landscape)',
	tiny: '(orientation: portrait) and (max-height: 599px)',
	dark: '(prefers-color-scheme: dark)',
	noanimations: '(prefers-reduced-motion: reduce)'
}

/**
 * @typedef {Object.<string, boolean>} MediaAttributes - Media object with additional attributes and a classNames property.
 *
 * @typedef MediaClasses
 * @property {string} classNames - A string representing the class names associated with the media object.
 *
 * @typedef {MediaAttributes & MediaClasses} Media
 */

/**
 * Calculates the current media state based on the given media queries.
 *
 * @param {MediaQueryList} queries
 * @returns {Media}
 */
export function calculate(queries) {
	const media = { classNames: '' }
	const classNames = []

	for (const name in queries) {
		media[name] = queries[name].matches
		if (media[name]) {
			classNames.push(`media-${name}`)
		}
	}
	media.classNames = classNames.join(' ')
	return media
}

/**
 * Watch the media queries and update the store with the current media state.
 *
 * @param {*} breakpoints
 * @returns
 */
export function watchMedia(breakpoints = defaultBreakpoints) {
	const { set, subscribe } = writable({ classNames: '' })
	if (typeof window === 'undefined') return { subscribe }

	const queries = {}
	const updateMedia = () => set(calculate(queries))

	for (const key in breakpoints) {
		queries[key] = window.matchMedia(breakpoints[key])
		queries[key].addListener(updateMedia)
	}

	updateMedia()
	const destroy = () => {
		for (const key in queries) {
			queries[key].removeListener(updateMedia)
		}
	}

	return { subscribe, destroy }
}

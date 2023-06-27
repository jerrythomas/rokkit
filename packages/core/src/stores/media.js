/**
 * Taken from https://github.com/cibernox/svelte-media and converted to esm with jsdoc.
 */
import { writable } from 'svelte/store'

/**
 * @typedef Breakpoints
 * @type {Object.<{string|bookean}, string>}
 */
/**
 * @typedef MediaQueryList
 * @property {boolean} matches
 */

/**
 * @typedef MediaQueryLists
 * @type {Object.<string, MediaQueryList>}
 */

/**
 *
 * @param {MediaQueryLists} mqls
 * @returns
 */
function calculateMedia(mqls) {
	let media = { classNames: '' }
	let mediaClasses = []
	for (let name in mqls) {
		media[name] = mqls[name].matches
		if (media[name]) {
			mediaClasses.push(`media-${name}`)
		}
	}
	media.classNames = mediaClasses.join(' ')
	return media
}

/**
 * @param {Breakpoints} breakpoints
 * @returns {import('svelte/store').Writable<Media>}
 * @example
 * ```js
 * import { watchMedia } from 'svelte-media'
 *
 * let breakpoints = {
 *  small: '(max-width: 849px)',
 *  large: '(min-width: 850px)',
 *  short: '(max-height: 399px)',
 *  wide: '(min-width: 960px)',
 *  widest: '(min-width: 1260px)',
 *  landscape: '(orientation: landscape) and (max-height: 499px)',
 *  tiny: '(orientation: portrait) and (max-height: 599px)'
 * }
 * let store = watchMedia(breakpoints)
 * ```
 */
export function watchMedia(breakpoints) {
	return writable({ classNames: '' }, (set) => {
		if (typeof window === 'undefined') return
		let mqls = {}
		let updateMedia = () => set(calculateMedia(mqls))
		for (let key in breakpoints) {
			let foo = window.matchMedia(breakpoints[key])
			mqls[key] = foo
			mqls[key].addListener(updateMedia)
		}
		updateMedia()
		return () => {
			for (let key in mqls) {
				mqls[key].removeListener(updateMedia)
			}
		}
	})
}

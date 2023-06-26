import { writable } from 'svelte/store'

// type Media<Query extends Record<string, string> = Record<string, string>> = {
//   [K in keyof Query]?: boolean | string;
// } & {
//   classNames: string;
// };

// type MediaQueryLists = Record<string, MediaQueryList>;

/**
 * @typedef Media
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

export function media(mediaqueries) {
	return writable({ classNames: '' }, (set) => {
		if (typeof window === 'undefined') return
		let mqls = {}
		let updateMedia = () => set(calculateMedia(mqls))
		for (let key in mediaqueries) {
			let foo = window.matchMedia(mediaqueries[key])
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

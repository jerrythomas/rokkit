import { MediaQuery } from 'svelte/reactivity'

/** @type {Record<string, string>} */
export const defaultBreakpoints = {
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

/** @param {Record<string, string>} breakpoints */
export function watchMedia(breakpoints = defaultBreakpoints) {
	/** @type {Record<string, MediaQuery>} */
	const current = {}
	for (const [key, query] of Object.entries(breakpoints)) {
		current[key] = new MediaQuery(query)
	}
	return current
}

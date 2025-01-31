import { MediaQuery } from 'svelte/reactivity'

/* @type {Record<string, string>} */
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

export function watchMedia(breakpoints = defaultBreakpoints) {
	/** @type {Record<string, MediaQuery>} */
	const current = {}
	Object.entries(breakpoints).forEach(([key, value]) => {
		current[key] = new MediaQuery(value)
	})

	return current
}

export const media = watchMedia()

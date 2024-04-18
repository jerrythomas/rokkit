import { writable } from 'svelte/store'
import { persistable } from './persist'
import { pick } from 'ramda'

const THEME_STORE_KEY = 'app-theme'
const DEFAULT_THEME = { name: 'rokkit', mode: 'dark' }

/**
 * @typedef {Object} Theme
 * @property {string} name
 * @property {string} mode
 */

/**
 * Custom store that takes an object with two properties, name and mode.
 * @returns {import('svelte/store').Writable<Theme>}
 */
export function ThemeStore() {
	const store = writable(DEFAULT_THEME)

	const set = (value) => {
		const partial = pick(['name', 'mode'], value)
		const isValid = Object.keys(partial).every((key) => typeof value[key] === 'string')
		if (isValid) {
			store.update((cur) => ({ ...cur, ...partial }))
		} else if (Object.keys(partial).length > 0) {
			console.error('Both "name" and "mode" must be strings', value)
		}
	}

	return {
		...store,
		set
	}
}

export const theme = persistable(THEME_STORE_KEY, ThemeStore())

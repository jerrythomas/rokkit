import { writable } from 'svelte/store'
import { persistable } from './persist'

const THEME_STORE_KEY = 'app-theme'

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
	const store = writable({ name: 'rokkit', mode: 'dark' })

	const set = (value) => {
		const { name, mode } = value ?? {}
		if (typeof name === 'string' && typeof mode === 'string') {
			store.set(value)
		} else if (value) {
			console.error('Both "name" and "mode" must be strings', value)
		}
	}

	return {
		...store,
		set
	}
}

export const theme = persistable(THEME_STORE_KEY, ThemeStore())

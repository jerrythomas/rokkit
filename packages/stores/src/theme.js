import { writable } from 'svelte/store'
import { persistable } from './persist'

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
		const { name, mode } = { ...DEFAULT_THEME, ...value }
		if (typeof name === 'string' && typeof mode === 'string') {
			store.set({ name, mode })
		} else {
			console.error('Both "name" and "mode" must be strings', value)
			store.set(DEFAULT_THEME)
		}
	}

	return {
		...store,
		set
	}
}

export const theme = persistable(THEME_STORE_KEY, ThemeStore())

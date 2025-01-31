/**
 * @typedef {'dark'|'light'} ThemeMode
 */

import { SvelteSet } from 'svelte/reactivity'

/**
 * @typedef {string} Theme
 */

/**
 * @typedef {Object} Shades
 * @property {string} 50
 * @property {string} 100
 * @property {string} 200
 * @property {string} 300
 * @property {string} 400
 * @property {string} 500
 * @property {string} 600
 * @property {string} 700
 * @property {string} 800
 * @property {string} 900
 * @property {string} 950
 */

/**
 * @typedef {Object} Palette
 * @property {string} primary
 * @property {string} onPrimary
 * @property {string} secondary
 * @property {string} onSecondary
 * @property {string} accent
 * @property {string} onAccent
 * @property {string} neutral
 * @property {string} onNeutral
 * @property {string} error
 * @property {string} onError
 * @property {string} warning
 * @property {string} onWarning
 * @property {string} info
 * @property {string} onInfo
 * @property {string} success
 * @property {string} onSuccess
 */

export class ThemeManager {
	/** @type {string} */
	name = $state('rokkit')
	/** @type {ThemeMode} */
	mode = $state('dark')
	/** @type {string} */
	#prefix = 'app-'

	#allowedThemes = new SvelteSet(['rokkit', 'material', 'minimal'])
	#allowedModes = ['dark', 'light']
}

export const theme = new ThemeManager()

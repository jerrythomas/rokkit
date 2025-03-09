/** @typedef {'light' | 'dark'} ThemeMode */
/** @typedef {'cozy' | 'compact' | 'comfortable'} Density */

import { defaultColors, defaultThemeMapping, themeRules } from '@rokkit/core'
import { DEFAULT_STYLES, VALID_DENSITIES, VALID_MODES } from './constants'
import { has } from 'ramda'

/**
 * Transforms theme rules array into an object grouped by mode
 * @param {Array<[string, Object.<string, string>]>} themeRules
 * @returns {Object.<string, Object.<string, string>>}
 */
function groupThemeRulesByMode(themeRules) {
	return themeRules.reduce((acc, [name, variables]) => {
		const mode = name.includes('mode-') ? name.split('mode-')[1] : name
		return { ...acc, [mode]: variables }
	}, {})
}

/**
 * Checks if a value is allowed based on a list of allowed values and the current value
 * @param {string} value
 * @param {string[]} allowed
 * @param {string} current
 * @returns
 */
function isAllowedValue(value, allowed, current) {
	return allowed.includes(value) && value !== current
}

/**
 * Vibe - Theme management
 */
class Vibe {
	#allowedStyles = $state(DEFAULT_STYLES)
	#mode = $state('dark')
	#style = $state('rokkit')
	#colors = $state(defaultColors)
	#density = $state('comfortable')
	#colorMap = $state(defaultThemeMapping)
	#palette = $derived.by(() => {
		const grouped = groupThemeRulesByMode(themeRules(this.#style, this.#colorMap, this.#colors))
		return grouped[this.#mode]
	})
	#hasChanged = false

	/**
	 * Private constructor to enforce singleton pattern
	 * @param {VibeOptions} [options={}]
	 */
	constructor(options = {}) {
		this.mode = options.mode
		this.style = options.style
		this.density = options.density
		this.colorMap = options.colorMap
		this.colors = options.colors
	}

	set allowedStyles(input) {
		const styles = (Array.isArray(input) ? input : [input]).filter(Boolean)
		if (styles.length > 0) {
			this.#allowedStyles = styles
		}
	}

	set colorMap(value) {
		if (value) {
			const missing = Object.values(value).filter((key) => !has(key, this.#colors))
			if (missing.length > 0) {
				throw new Error(`Did you forget to define "${missing.join(', ')}"?`)
			}
			this.#colorMap = { ...defaultThemeMapping, ...value }
		}
	}

	set colors(value) {
		if (value) {
			this.#colors = { ...defaultColors, ...value }
		}
	}

	get style() {
		return this.#style
	}

	set style(value) {
		if (isAllowedValue(value, this.#allowedStyles, this.#style)) {
			this.#style = value
		}
	}

	get mode() {
		return this.#mode
	}

	set mode(value) {
		if (isAllowedValue(value, VALID_MODES, this.#mode)) {
			this.#mode = value
		}
	}

	get density() {
		return this.#density
	}

	set density(value) {
		if (isAllowedValue(value, VALID_DENSITIES, this.#density)) {
			this.#density = value
		}
	}

	get palette() {
		return this.#palette
	}

	/**
	 * Load theme from storage
	 * @param {string} key
	 */
	load(key) {
		try {
			const stored = localStorage.getItem(key)
			if (stored) {
				this.update(JSON.parse(stored))
			}
		} catch (e) {
			// eslint-disable-next-line no-console
			console.warn(`Failed to load theme from storage for key "${key}"`, e.message)
		}
	}

	/**
	 * Save current theme to storage
	 * @param {string} key
	 */
	save(key) {
		if (!key) throw new Error('Key is required')

		try {
			const config = { style: this.#style, mode: this.#mode, density: this.#density }
			localStorage.setItem(key, JSON.stringify(config))
		} catch (e) {
			// eslint-disable-next-line no-console
			console.warn(`Failed to save theme to storage for key "${key}"`, e.message)
		}
	}

	/**
	 * Update theme with new values
	 * @param {Partial<Theme>} value
	 */
	update(value) {
		this.style = value.style
		this.mode = value.mode
		this.density = value.density
	}
}

export const vibe = new Vibe()

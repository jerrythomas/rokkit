import { DEFAULT_THEME_MAPPING } from '@rokkit/core'

export const DEFAULT_CONFIG = {
	palettes: {},
	colors: {
		primary: DEFAULT_THEME_MAPPING.primary,
		secondary: DEFAULT_THEME_MAPPING.secondary,
		accent: DEFAULT_THEME_MAPPING.accent,
		surface: DEFAULT_THEME_MAPPING.surface,
		success: DEFAULT_THEME_MAPPING.success,
		warning: DEFAULT_THEME_MAPPING.warning,
		danger: DEFAULT_THEME_MAPPING.danger,
		error: DEFAULT_THEME_MAPPING.error,
		info: DEFAULT_THEME_MAPPING.info
	},
	skins: {},
	themes: ['rokkit'],
	icons: {
		app: '@rokkit/icons/app.json'
	},
	typography: {
		sans: null,
		mono: null,
		heading: null
	},
	shape: {
		radius: null
	},
	switcher: 'manual',
	storageKey: 'rokkit-theme'
}

const KNOWN_KEYS = new Set(Object.keys(DEFAULT_CONFIG))

/**
 * @param {unknown} value
 * @param {unknown} fallback
 * @returns {unknown}
 */
function pick(value, fallback) {
	return value !== undefined ? value : fallback
}

/**
 * Strip unknown keys from merged result
 * @param {Record<string, unknown>} result
 */
function stripUnknownKeys(result) {
	for (const key of Object.keys(result)) {
		if (!KNOWN_KEYS.has(key)) delete result[key]
	}
}

/**
 * Merge user configuration with defaults.
 *
 * @param {Partial<typeof DEFAULT_CONFIG>} [userConfig={}]
 * @returns {typeof DEFAULT_CONFIG}
 */
export function loadConfig(userConfig) {
	const cfg = userConfig || {}
	const result = {
		palettes: pick(cfg.palettes, DEFAULT_CONFIG.palettes),
		colors: { ...DEFAULT_CONFIG.colors, ...cfg.colors },
		skins: pick(cfg.skins, DEFAULT_CONFIG.skins),
		themes: pick(cfg.themes, DEFAULT_CONFIG.themes),
		icons: { ...DEFAULT_CONFIG.icons, ...cfg.icons },
		typography: { ...DEFAULT_CONFIG.typography, ...cfg.typography },
		shape: { ...DEFAULT_CONFIG.shape, ...cfg.shape },
		switcher: pick(cfg.switcher, DEFAULT_CONFIG.switcher),
		storageKey: pick(cfg.storageKey, DEFAULT_CONFIG.storageKey)
	}

	stripUnknownKeys(result)

	return result
}

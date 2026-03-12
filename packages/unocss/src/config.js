import { DEFAULT_THEME_MAPPING } from '@rokkit/core'

export const DEFAULT_CONFIG = {
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
	switcher: 'manual',
	storageKey: 'rokkit-theme'
}

const KNOWN_KEYS = new Set(Object.keys(DEFAULT_CONFIG))

/**
 * Merge user configuration with defaults.
 *
 * @param {Partial<typeof DEFAULT_CONFIG>} [userConfig={}]
 * @returns {typeof DEFAULT_CONFIG}
 */
export function loadConfig(userConfig = {}) {
	const result = {
		colors: { ...DEFAULT_CONFIG.colors, ...userConfig.colors },
		skins: userConfig.skins ?? DEFAULT_CONFIG.skins,
		themes: userConfig.themes ?? DEFAULT_CONFIG.themes,
		icons: { ...DEFAULT_CONFIG.icons, ...userConfig.icons },
		switcher: userConfig.switcher ?? DEFAULT_CONFIG.switcher,
		storageKey: userConfig.storageKey ?? DEFAULT_CONFIG.storageKey
	}

	for (const key of Object.keys(result)) {
		if (!KNOWN_KEYS.has(key)) delete result[key]
	}

	return result
}

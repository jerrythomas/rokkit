import { DEFAULT_THEME_MAPPING } from '@rokkit/core'

const DEFAULT_SKIN = { ...DEFAULT_THEME_MAPPING }

export const DEFAULT_CONFIG = {
	palettes: {},
	colorSpace: 'rgb',
	/**
	 * Single-skin mode: define the app's colormap directly.
	 * Use this when the app has one fixed colormap.
	 * Mutually exclusive with `skins` — if `skins` is provided, `skin` is ignored.
	 */
	skin: DEFAULT_SKIN,
	/**
	 * Multi-skin mode: named colormaps for programmatic or user-driven switching.
	 * The `default` key is the active colormap when no skin is selected.
	 * Mutually exclusive with `skin` — if `skins` is provided, `skin` is ignored.
	 */
	skins: {},
	themes: ['rokkit'],
	icons: {
		app: '@rokkit/icons/app.json',
		style: undefined,
		collection: undefined
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

/**
 * Returns `value` when defined (non-null, non-undefined), otherwise `fallback`.
 * @param {unknown} value
 * @param {unknown} fallback
 */
function pick(value, fallback) {
	return value ?? fallback
}

/**
 * Merge user configuration with defaults.
 *
 * Accepts `colors` as a backward-compatible alias for `skin`.
 * Use `skin` (singular) for a single fixed colormap, or `skins` (plural) for
 * multiple named colormaps. Providing `skins` takes precedence over `skin`.
 *
 * @param {Partial<typeof DEFAULT_CONFIG>} [userConfig={}]
 * @returns {typeof DEFAULT_CONFIG}
 */
export function loadConfig(userConfig) {
	const cfg = userConfig ?? {}
	return {
		palettes:   pick(cfg.palettes, DEFAULT_CONFIG.palettes),
		colorSpace: pick(cfg.colorSpace, DEFAULT_CONFIG.colorSpace),
		// 'colors' is a backward-compatible alias for 'skin'
		skin:       { ...DEFAULT_SKIN, ...(cfg.skin ?? cfg.colors ?? {}) },
		skins:      pick(cfg.skins, DEFAULT_CONFIG.skins),
		themes:     pick(cfg.themes, DEFAULT_CONFIG.themes),
		icons:      { ...DEFAULT_CONFIG.icons, ...cfg.icons },
		typography: { ...DEFAULT_CONFIG.typography, ...cfg.typography },
		shape:      { ...DEFAULT_CONFIG.shape, ...cfg.shape },
		switcher:   pick(cfg.switcher, DEFAULT_CONFIG.switcher),
		storageKey: pick(cfg.storageKey, DEFAULT_CONFIG.storageKey)
	}
}

/**
 * Resolve the effective colormap from config.
 *
 * - Multi-skin mode (`skins` provided): uses `skins.default` if present, else falls back to `skin`.
 * - Single-skin mode (`skin` provided): uses `skin` directly.
 *
 * @param {typeof DEFAULT_CONFIG} config
 * @returns {Record<string, string | { light?: string, dark?: string }>}
 */
export function resolveColormap(config) {
	if (Object.keys(config.skins).length > 0) {
		return config.skins.default ?? config.skin
	}
	return config.skin
}

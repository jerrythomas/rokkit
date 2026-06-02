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
	tokens: 'core',
	overrides: {},
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
		tokens:     validateTokens(cfg.tokens ?? DEFAULT_CONFIG.tokens),
		overrides:  pick(cfg.overrides, DEFAULT_CONFIG.overrides),
		icons:      { ...DEFAULT_CONFIG.icons, ...cfg.icons },
		typography: { ...DEFAULT_CONFIG.typography, ...cfg.typography },
		shape:      { ...DEFAULT_CONFIG.shape, ...cfg.shape },
		switcher:   pick(cfg.switcher, DEFAULT_CONFIG.switcher),
		storageKey: pick(cfg.storageKey, DEFAULT_CONFIG.storageKey)
	}
}

/**
 * Returns true when a colormap value is an alias object ({ alias: 'target' }).
 * @param {unknown} value
 * @returns {boolean}
 */
export function isAlias(value) {
	return value !== null && typeof value === 'object' && !Array.isArray(value) && 'alias' in value
}

/**
 * Validates alias entries in a colormap.
 * - Alias target must exist as a non-alias entry
 * - No circular aliases (A→B, B→A)
 * - No chained aliases (A→B, B→C where B is also an alias)
 * @param {Record<string, unknown>} colormap
 */
function validateAliases(colormap) {
	const aliases = Object.entries(colormap).filter(([, v]) => isAlias(v))

	for (const [name, value] of aliases) {
		const target = value.alias

		// Target must exist in the colormap
		if (!(target in colormap)) {
			throw new Error(`Alias '${name}' points to '${target}' which is not defined in this skin.`)
		}

		// Target must not be another alias (no chaining)
		if (isAlias(colormap[target])) {
			// Check if it's circular (A→B, B→A)
			if (colormap[target].alias === name) {
				throw new Error(`Circular alias: '${name}' → '${target}' → '${name}'.`)
			}
			throw new Error(`Chained alias: '${name}' → '${target}' which is itself an alias. Aliases must point to a real palette.`)
		}
	}
}

const VALID_TOKEN_MODES = new Set(['core', 'extended'])

/**
 * Validates per-role token modes in an object.
 * @param {Record<string, unknown>} roleMap
 */
function validateTokenRoles(roleMap) {
	for (const [role, mode] of Object.entries(roleMap)) {
		if (!VALID_TOKEN_MODES.has(mode)) {
			throw new Error(
				`Invalid tokens mode for role "${role}": "${mode}". Expected "core" or "extended".`
			)
		}
	}
}

/**
 * Validates tokens configuration.
 * Accepts:
 * - A string: 'core' or 'extended' (applies globally to all roles)
 * - An object: per-role mapping (e.g., { surface: 'core', primary: 'extended' })
 * @param {unknown} value
 * @returns {string | Record<string, string>}
 */
function validateTokens(value) {
	if (typeof value === 'string') {
		if (!VALID_TOKEN_MODES.has(value)) {
			throw new Error(`Invalid tokens mode "${value}". Expected "core" or "extended".`)
		}
		return value
	}
	if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
		validateTokenRoles(value)
		return value
	}
	throw new Error(`tokens must be "core", "extended", or an object — got ${typeof value}.`)
}

/**
 * Resolves the token mode for a specific role.
 * - If config.tokens is a string, that's the mode for every role.
 * - If it's a per-role object, look up the role; fall back to 'core' when absent.
 * - If config.tokens is missing entirely, defaults to 'core'.
 * @param {Partial<typeof DEFAULT_CONFIG>} config
 * @param {string} role
 * @returns {string}
 */
export function resolveTokenMode(config, role) {
	const t = config.tokens
	if (typeof t === 'string') return t
	if (t && typeof t === 'object') return t[role] ?? 'core'
	return 'core'
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
	let colormap
	if (Object.keys(config.skins).length > 0) {
		colormap = config.skins.default ?? config.skin
	} else {
		colormap = config.skin
	}
	validateAliases(colormap)
	return colormap
}

/**
 * The colour side of the preset: CSS-var preflight blocks (`:root` light, `[data-mode="dark"]`,
 * one per named skin) and the theme's colour rules. Pure over a loaded config and its colormap.
 */
import { Theme, defaultColors } from '@rokkit/core'
import { isAlias, resolveTokenMode } from './config.js'
import { resolveTokens } from './custom-tokens.js'

/**
 * The skin name treated as the active default. Its named-token vars are carried
 * by the `:root` preflight, so we never emit a competing `[data-skin='default']`
 * block — `data-skin='default'` simply inherits `:root`.
 */
const DEFAULT_SKIN_NAME = 'default'

/**
 * Returns true when a colormap value is a { light?, dark? } dual-palette object
 * rather than a plain palette-name string.
 */
export function isDualPalette(value) {
	return value !== null && typeof value === 'object' && !Array.isArray(value)
}

/** True when any role in a colormap uses dual-palette syntax. */
const hasDualPaletteMapping = (colormap) => Object.values(colormap).some(isDualPalette)

/** The roles whose mapping is a real palette — aliases get no CSS variables of their own. */
export function withoutAliases(mapping) {
	return Object.fromEntries(Object.entries(mapping).filter(([, v]) => !isAlias(v)))
}

/**
 * Resolves a colormap to flat palette-name strings for a given mode.
 * String values pass through unchanged.
 * { light, dark } objects resolve to the matching side, falling back to the other.
 */
export function resolveMappingForMode(colormap, mode) {
	return Object.fromEntries(
		Object.entries(colormap).map(([role, value]) => [
			role,
			isDualPalette(value)
				? /* v8 ignore next — the ?? null fallbacks require both light+dark absent, which causes downstream errors */
					mode === 'dark'
					? (value.dark ?? value.light ?? null)
					: (value.light ?? value.dark ?? null)
				: value
		])
	)
}

/**
 * The Theme for one mode of a mapping: the default colours plus the config's palettes, the
 * mapping's non-alias roles resolved to that mode's palette names.
 * @param {Record<string, unknown>} mapping
 * @param {Record<string, any>} config - a loaded config
 * @param {'light' | 'dark'} mode
 */
export function themeFor(mapping, config, mode) {
	return new Theme({
		colors: { ...defaultColors, ...config.palettes },
		mapping: resolveMappingForMode(withoutAliases(mapping), mode),
		colorSpace: config.colorSpace
	})
}

const toCssBlock = (vars) =>
	Object.entries(vars)
		.map(([k, v]) => `${k}:${v}`)
		.join(';')

/** Builds a per-role mode map from config, covering every role in colormap. */
function perRoleModes(config, colormap) {
	return Object.fromEntries(Object.keys(colormap).map((role) => [role, resolveTokenMode(config, role)]))
}

/**
 * Builds CSS-var assignments for one mode (light or dark).
 *  - core: named tokens (palette values inlined) + bare `--color-{role}` alias per role
 *  - extended: full palette per role + named tokens as palette aliases
 * Supports per-role decomposition via config.tokens object.
 */
function varsForMode(theme, colormap, config) {
	const modes = perRoleModes(config, colormap)
	const result = { ...theme.getNamedTokens('light', modes) }
	for (const role of Object.keys(colormap)) {
		if (isAlias(colormap[role])) continue
		Object.assign(result, modes[role] === 'extended' ? theme.getPaletteForRole(role) : theme.getRoleBaseAlias(role))
	}
	return result
}

/** The config's override tokens for one mode. */
function overrideVars(config, mode) {
	return resolveTokens(
		/* v8 ignore next — loadConfig always ensures overrides is {} */
		config.overrides ?? {},
		/* v8 ignore next — loadConfig always ensures palettes is {} */
		config.palettes ?? {},
		config.colorSpace,
		mode
	)
}

/** True when any override declares a dark value, as `{ light, dark }` or dark-only. */
function hasDarkOverride(config) {
	/* v8 ignore next — loadConfig always ensures overrides is {} */
	return Object.values(config.overrides ?? {}).some(
		(v) => v && typeof v === 'object' && !Array.isArray(v) && 'dark' in v
	)
}

/**
 * The `[data-mode="dark"]` block, or `''` when nothing asks for one — emitted
 * only when the skin has a dual palette OR an override declares a dark value.
 * Returning empty rather than a no-op block keeps the output free of a selector
 * that would match and set nothing.
 */
function darkBlock(colormap, config) {
	if (!hasDualPaletteMapping(withoutAliases(colormap)) && !hasDarkOverride(config)) return ''
	const darkVars = varsForMode(themeFor(colormap, config, 'dark'), colormap, config)
	return `[data-mode="dark"]{${toCssBlock({ ...darkVars, ...overrideVars(config, 'dark') })}}`
}

/**
 * The `:root` preflight: the light colour vars (overrides after the named-token defaults, so a
 * reserved name like `paper-edge` wins over the skin-derived value), then `extraVars` in their
 * own `:root` block, then the dark block when one is needed.
 *
 * @param {Theme} theme - the light theme (`themeFor(colormap, config, 'light')`)
 * @param {Record<string, unknown>} colormap
 * @param {Record<string, any>} config
 * @param {string[]} extraVars - non-colour `name:value` vars (typography.js)
 */
export function rootPreflights(theme, colormap, config, extraVars) {
	const lightVars = { ...varsForMode(theme, colormap, config), ...overrideVars(config, 'light') }
	const lightBlock = `:root, [data-mode="light"]{${toCssBlock(lightVars)}}${
		extraVars.length ? `:root{${extraVars.join(';')}}` : ''
	}`
	return [{ getCSS: () => `${lightBlock}${darkBlock(colormap, config)}` }]
}

/**
 * One skin's named-token vars in one mode — the same builder `:root` uses, so the blocks are
 * identical in form; only the selector differs. Aliases get no vars.
 */
function skinVars(mapping, config, mode) {
	const roles = withoutAliases(mapping)
	return varsForMode(themeFor(mapping, config, mode), roles, config)
}

/**
 * `[data-skin='name']` preflight blocks for every configured skin EXCEPT the default (whose
 * vars live in `:root`):
 *  - light block: `[data-skin='name']{…light vars…}`
 *  - dark block (only when the skin has a dual-palette role):
 *      `[data-mode='dark'][data-skin='name']{…dark vars…}`
 * The dark selector uses single-quoted attributes; the test contract accepts
 * either quoting, and single quotes match the `data-skin` quoting used here.
 */
export function skinPreflights(config) {
	return Object.entries(config.skins)
		.filter(([name]) => name !== DEFAULT_SKIN_NAME)
		.map(([name, mapping]) => {
			const lightBlock = `[data-skin='${name}']{${toCssBlock(skinVars(mapping, config, 'light'))}}`
			const dark = hasDualPaletteMapping(withoutAliases(mapping))
				? `[data-mode='dark'][data-skin='${name}']{${toCssBlock(skinVars(mapping, config, 'dark'))}}`
				: ''
			return { getCSS: () => `${lightBlock}${dark}` }
		})
}

/**
 * The theme's colour rules plus the config's palettes, with each alias role given rules that
 * point at its target's CSS variables.
 */
export function themeColors(theme, colormap, config) {
	const baseColors = { ...theme.getColorRules(), ...config.palettes }
	for (const [role, value] of Object.entries(colormap)) {
		if (isAlias(value) && baseColors[value.alias]) {
			const target = value.alias
			/* v8 ignore next 3 — alias validation ensures target's mapping exists; `|| {}` is unreachable */
			baseColors[role] = theme.mapVariant(theme.colors[theme.mapping[target]] || {}, target)
		}
	}
	return baseColors
}

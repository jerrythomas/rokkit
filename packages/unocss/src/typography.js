/**
 * The non-colour `:root` vars a rokkit config produces: font roles and radius. There is no
 * type scale: headings are styled through `[data-heading]` rules in @rokkit/themes (#152).
 * Pure — config in, `name:value` strings out, in emit order.
 */

/**
 * Font roles, in emit order. Canonical (semantic) names match the named-token
 * vocabulary:
 *   --font-display — the heading / display typeface
 *   --font-ui      — the body / UI typeface
 *   --font-mono    — code, eyebrows, kbd shortcuts
 *
 * `keys` lists the config keys that can supply the role, most-canonical first —
 * the legacy `heading` / `sans` spellings are still accepted. `legacyVar`, where
 * present, is emitted as an alias so consumers still reading the old CSS var
 * name keep working; see the typography.css base layer.
 */
const FONT_ROLES = [
	{ token: 'display', keys: ['display', 'heading'], legacyVar: '--font-heading' },
	{ token: 'ui', keys: ['ui', 'sans'], legacyVar: '--font-sans' },
	{ token: 'mono', keys: ['mono'], legacyVar: null }
]

/** First value that is present at all — `??`-chain semantics, so `''` does not fall through. */
const firstDefined = (values) => values.find((v) => v !== undefined && v !== null)

/**
 * `--font-{display,ui,mono}` for each configured role, then the legacy aliases.
 * @param {Record<string, string> | undefined} typography
 * @returns {string[]}
 */
export function fontVars(typography) {
	if (!typography) return []
	const vars = []
	// Aliases are collected separately so they all follow the canonical vars,
	// preserving the emit order consumers' snapshots were written against.
	const aliases = []
	for (const { token, keys, legacyVar } of FONT_ROLES) {
		const value = firstDefined(keys.map((key) => typography[key]))
		if (!value) continue
		vars.push(`--font-${token}:${value}`)
		if (legacyVar) aliases.push(`${legacyVar}:var(--font-${token})`)
	}
	return [...vars, ...aliases]
}

const RADIUS_PRESETS = {
	sharp: { sm: '0', md: '0', lg: '0', xl: '0', full: '9999px' },
	soft: { sm: '0.125rem', md: '0.375rem', lg: '0.625rem', xl: '0.75rem', full: '9999px' },
	rounded: { sm: '0.25rem', md: '0.5rem', lg: '0.75rem', xl: '1rem', full: '9999px' },
	pill: { sm: '9999px', md: '9999px', lg: '9999px', xl: '9999px', full: '9999px' }
}
const RADIUS_KEYS = ['sm', 'md', 'lg', 'xl', 'full']

/**
 * `--radius-*` from a named preset (`sharp` / `soft` / `rounded` / `pill`) or a per-key object.
 * @param {{ radius?: string | Record<string, string> } | undefined} shape
 * @returns {string[]}
 */
export function radiusVars(shape) {
	const radiusKey = shape?.radius
	if (!radiusKey) return []
	const preset = typeof radiusKey === 'string' ? RADIUS_PRESETS[radiusKey] : radiusKey
	if (!preset) return []
	return RADIUS_KEYS.filter((k) => preset[k] !== undefined).map((k) => `--radius-${k}:${preset[k]}`)
}

/**
 * Every non-colour `:root` var, in emit order: fonts, then radius.
 * @param {{ typography?: Record<string, any>, shape?: Record<string, any> }} config
 * @returns {string[]}
 */
export function rootExtraVars(config) {
	return [...fontVars(config.typography), ...radiusVars(config.shape)]
}

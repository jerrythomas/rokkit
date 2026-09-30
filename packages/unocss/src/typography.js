/**
 * The non-colour `:root` vars a rokkit config produces: font roles, the type scale, and radius.
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

/**
 * Type scale — one ratio, per-level overrides, emitted as
 * `--text-{level}` / `--leading-{level}` / `--weight-{level}`.
 *
 * Levels are h1–h4 + body + small. h5/h6 are deliberately absent: nothing in the app,
 * the component library or the rendered guides uses them (measured — h4 itself is 0 and
 * kept only as headroom), and tokens with no consumer are dead output nobody can verify.
 *
 * Sizes derive from `body` × ratio^n so one knob moves the whole scale, with `levels`
 * overriding any single step — the same shape `--radius-*` already offers (named preset
 * plus per-key override) rather than a new idiom. Line-height tightens as size grows,
 * because a heading set at body line-height reads loose.
 *
 * Deliberately density-independent: control heights are fixed so controls align, and
 * type that resized with density would break that alignment and reflow every layout on
 * a density toggle.
 */
const TYPE_LEVELS = ['h1', 'h2', 'h3', 'h4', 'body', 'small']
/** Steps above `body` (0). Negative goes smaller. */
const TYPE_STEPS = { h1: 4, h2: 3, h3: 2, h4: 1, body: 0, small: -1 }
const TYPE_LEADING = { h1: 1.1, h2: 1.15, h3: 1.25, h4: 1.35, body: 1.5, small: 1.45 }
const TYPE_WEIGHT = { h1: 600, h2: 600, h3: 600, h4: 600, body: 400, small: 400 }
const DEFAULT_TYPE_RATIO = 1.25
const DEFAULT_TYPE_BASE = 1

const roundRem = (n) => Math.round(n * 1000) / 1000

/** A positive number from config, else the default. */
const positiveOr = (value, fallback) => (Number(value) > 0 ? Number(value) : fallback)

/**
 * @param {{ ratio?: number, base?: number, levels?: Record<string, string> } | undefined} typography
 * @returns {string[]}
 */
export function typeScaleVars(typography) {
	const ratio = positiveOr(typography?.ratio, DEFAULT_TYPE_RATIO)
	const base = positiveOr(typography?.base, DEFAULT_TYPE_BASE)
	const overrides = typography?.levels ?? {}

	return TYPE_LEVELS.flatMap((level) => {
		const size = overrides[level] ?? `${roundRem(base * ratio ** TYPE_STEPS[level])}rem`
		return [
			`--text-${level}:${size}`,
			`--leading-${level}:${TYPE_LEADING[level]}`,
			`--weight-${level}:${TYPE_WEIGHT[level]}`
		]
	})
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
 * Every non-colour `:root` var, in emit order: fonts, the type scale (unconditional — a scale
 * that only appeared when configured would leave every existing consumer with no sizes), radius.
 * @param {{ typography?: Record<string, any>, shape?: Record<string, any> }} config
 * @returns {string[]}
 */
export function rootExtraVars(config) {
	return [...fontVars(config.typography), ...typeScaleVars(config.typography), ...radiusVars(config.shape)]
}

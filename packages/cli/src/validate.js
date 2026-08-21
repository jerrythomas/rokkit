/**
 * Advisory validation run by `doctor`: config shape rules for the named-token
 * system, and a scan for surface/border tokens misused as text colour.
 */

/**
 * Validate a parsed rokkit config for the named-token system. All advisory (warn).
 * @param {Record<string, unknown> | null} config
 * @returns {Array<{ id: string, label: string, status: 'warn', fixable: false, fix: string }>}
 */
/** True when the config still uses the back-compat `colors:` key instead of `skin:`. */
function usesLegacyColorsAlias({ colors, skin }) {
	return typeof colors === 'object' && colors !== null && !Array.isArray(colors) && !skin
}

/** True when oklch values are requested but no `palettes` block supplies them. */
function oklchWithoutPalettes(config) {
	return config.colorSpace === 'oklch' && Object.keys(config.palettes ?? {}).length === 0
}

/**
 * The config-shape rules, in report order: a predicate plus the advisory it
 * emits. Adding a rule is a new entry rather than another `if` block, and each
 * predicate stays small enough to read on its own.
 */
const SHAPE_RULES = [
	{
		when: ({ colormap }) => !('ink' in colormap),
		id: 'skin-ink-role',
		label: 'skin defines an `ink` role',
		fix: "Add `ink: '<palette>'` (reusing the surface palette is fine) — without it, ink-* text tokens fall back to the surface palette."
	},
	{
		when: ({ config }) => oklchWithoutPalettes(config),
		id: 'oklch-needs-palettes',
		label: 'colorSpace `oklch` has a `palettes` block',
		fix: 'oklch values need a `palettes` block of bare "L C H" components; Tailwind named colors are rgb.'
	},
	{
		when: ({ config }) => usesLegacyColorsAlias(config),
		id: 'colors-alias',
		label: 'config uses `skin` (not the legacy `colors` alias)',
		fix: 'Rename `colors:` to `skin:` — `colors` is a back-compat alias.'
	}
]

export function validateConfigShape(config) {
	if (!config) return []
	const colormap = config.skins?.default ?? config.skin ?? config.colors ?? {}
	return SHAPE_RULES.filter((rule) => rule.when({ config, colormap })).map(
		({ id, label, fix }) => ({ id, label, status: 'warn', fixable: false, fix })
	)
}

/**
 * Patterns that flag a surface/border token being used as a text colour.
 * paper-edge / paper-mute are border/surface tones — used as text they're faint
 * in light and invisible in dark. paper / paper-soft are legitimate on-colours.
 */
const TEXT_MISUSE_PATTERNS = [
	/text-paper-edge\b/,
	/text-paper-mute\b/,
	/color:\s*var\(\s*--paper-edge\s*\)/,
	/color:\s*var\(\s*--paper-mute\s*\)/
]

/**
 * Advisory lint: scan src/ for surface/border tokens used as text colour.
 * @param {{ list?: (dir: string) => string[], exists: (p: string) => boolean, read: (p: string) => string, resolve: (p: string) => string }} fs
 * @returns {Array<{ id: string, label: string, status: 'warn', fixable: false, fix: string }>}
 */
/**
 * `path:line` for every line of `source` that misuses a surface token as text
 * colour. Paths are reported relative to the cwd when they sit under it.
 * @param {string} file
 * @param {string} source
 * @param {string} cwd
 * @returns {string[]}
 */
function misuseHits(file, source, cwd) {
	const display = file.startsWith(cwd) ? file.slice(cwd.length).replace(/^\//, '') : file
	return source
		.split('\n')
		.map((line, i) => (TEXT_MISUSE_PATTERNS.some((re) => re.test(line)) ? `${display}:${i + 1}` : null))
		.filter(Boolean)
}

export function checkTextTokenUsage(fs) {
	if (typeof fs.list !== 'function' || !fs.exists(fs.resolve('src'))) return []

	const cwd = process.cwd()
	const hits = fs
		.list(fs.resolve('src'))
		.filter((file) => file.endsWith('.css') || file.endsWith('.svelte'))
		.flatMap((file) => misuseHits(file, fs.read(file), cwd))

	if (hits.length === 0) return []
	return [
		{
			id: 'surface-token-as-text',
			label: 'no surface/border token used as text colour',
			status: 'warn',
			fixable: false,
			fix: `paper-edge / paper-mute are border/surface tokens — never use them for text (faint in light, invisible in dark). Use the ink scale (ink-mute for readable secondary text). Found at:\n         ${hits.join('\n         ')}`
		}
	]
}

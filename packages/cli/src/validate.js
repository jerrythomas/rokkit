/**
 * Advisory validation run by `doctor`: config shape rules for the named-token
 * system, and a scan for surface/border tokens misused as text colour.
 */

/**
 * Validate a parsed rokkit config for the named-token system. All advisory (warn).
 * @param {Record<string, unknown> | null} config
 * @returns {Array<{ id: string, label: string, status: 'warn', fixable: false, fix: string }>}
 */
export function validateConfigShape(config) {
	if (!config) return []
	const checks = []
	const usesColorsAlias =
		typeof config.colors === 'object' && config.colors !== null && !Array.isArray(config.colors) && !config.skin
	const colormap = config.skins?.default ?? config.skin ?? config.colors ?? {}

	if (!('ink' in colormap)) {
		checks.push({
			id: 'skin-ink-role',
			label: 'skin defines an `ink` role',
			status: 'warn',
			fixable: false,
			fix: "Add `ink: '<palette>'` (reusing the surface palette is fine) — without it, ink-* text tokens fall back to the surface palette."
		})
	}
	if (config.colorSpace === 'oklch' && Object.keys(config.palettes ?? {}).length === 0) {
		checks.push({
			id: 'oklch-needs-palettes',
			label: 'colorSpace `oklch` has a `palettes` block',
			status: 'warn',
			fixable: false,
			fix: 'oklch values need a `palettes` block of bare "L C H" components; Tailwind named colors are rgb.'
		})
	}
	if (usesColorsAlias) {
		checks.push({
			id: 'colors-alias',
			label: 'config uses `skin` (not the legacy `colors` alias)',
			status: 'warn',
			fixable: false,
			fix: 'Rename `colors:` to `skin:` — `colors` is a back-compat alias.'
		})
	}
	return checks
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
export function checkTextTokenUsage(fs) {
	if (typeof fs.list !== 'function' || !fs.exists(fs.resolve('src'))) return []

	const cwd = process.cwd()
	const hits = []
	for (const file of fs.list(fs.resolve('src'))) {
		if (!file.endsWith('.css') && !file.endsWith('.svelte')) continue
		const lines = fs.read(file).split('\n')
		const display = file.startsWith(cwd) ? file.slice(cwd.length).replace(/^\//, '') : file
		lines.forEach((line, i) => {
			if (TEXT_MISUSE_PATTERNS.some((re) => re.test(line))) hits.push(`${display}:${i + 1}`)
		})
	}

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

/* eslint-disable no-console */
import prompts from 'prompts'
import { writeFileSync, readFileSync, existsSync } from 'fs'
import { resolve } from 'path'
import { execFileSync } from 'child_process'
import { detectPackageManager, buildInstallCommand } from './upgrade.js'
import { themeInitScript } from '@rokkit/unocss/hooks'

const ROKKIT_PACKAGES = ['@rokkit/ui', '@rokkit/unocss', '@rokkit/themes', '@rokkit/icons']
const LOCKFILES = ['bun.lock', 'bun.lockb', 'pnpm-lock.yaml', 'yarn.lock', 'package-lock.json']

const NAMED_TOKEN_HEADER = `/**
 * Rokkit token configuration — consumed by presetRokkit() in uno.config.js.
 *
 * Maps semantic roles (surface, ink, primary, accent, status…) to palettes.
 * The preset emits the named-token vocabulary used throughout components:
 *
 *   Surface  bg-paper · bg-paper-soft · bg-paper-mute · border-paper-edge
 *   Text     text-ink · text-ink-mute · text-ink-soft · text-ink-faint
 *   Accent   bg-primary · text-on-primary · bg-accent · bg-accent-soft
 *   Status   bg-success-soft · text-success   (+ warning / danger / error / info)
 *
 * Tokens flip automatically under [data-mode="dark"].
 *
 * tokens: 'core' emits the named vocabulary; 'extended' also emits the full
 * 11-shade palette ladder per role (for charts / data-viz).
 *
 * Also: \`skins\` (named alternates → \`[data-skin]\` blocks), \`switcher\`
 * ('system'|'manual'|'full'), \`storageKey\`, \`shape\`, \`typography\`.
 */
`

const OKLCH_PALETTES_NOTE = `/**
 * palettes: bare OKLCH "L C H" components (colorSpace: 'oklch'). surface/ink use
 * a { light, dark } dual palette — kami (warm paper) in light, sumi (ink) in dark.
 */
`

/**
 * Derive a safe localStorage key from an npm package name.
 * Strips the scope, keeps case, maps unsafe chars to '-'. Returns '' when there
 * is no usable name — the caller then omits `storageKey` rather than baking in a
 * hardcoded default (the consumer config / library fallback decides instead).
 * @param {string} [name]
 * @returns {string}
 */
export function storageKeyFromName(name) {
	return String(name ?? '')
		.replace(/^@/, '')
		.replace(/[^a-zA-Z0-9_-]+/g, '-')
		.replace(/^-+|-+$/g, '')
}

/**
 * Serialize a rokkit config object to a JS module string with a header comment.
 * @param {Record<string, unknown>} config
 * @returns {string}
 */
export function serializeRokkitConfig(config) {
	const palettesNote = config.palettes ? OKLCH_PALETTES_NOTE : ''
	return `${NAMED_TOKEN_HEADER}${palettesNote}export default ${JSON.stringify(config, null, 2)}\n`
}

/**
 * Detect if the current directory is a SvelteKit project.
 * @param {string} cwd
 * @returns {boolean}
 */
export function detectSvelteKit(cwd) {
	return existsSync(resolve(cwd, 'svelte.config.js')) || existsSync(resolve(cwd, 'svelte.config.ts'))
}

/**
 * Install Rokkit packages via the detected package manager.
 * Skips packages already in package.json.
 * @param {string} cwd
 * @param {{ runInstall?: (bin: string, args: string[]) => void }} [adapters]
 */
export function installPackages(cwd, adapters = {}) {
	const pkgPath = resolve(cwd, 'package.json')
	if (!existsSync(pkgPath)) {
		console.warn('  No package.json found — skipping install')
		return
	}

	const pkgJson = JSON.parse(readFileSync(pkgPath, 'utf-8'))
	const allDeps = { ...(pkgJson.dependencies || {}), ...(pkgJson.devDependencies || {}) }
	const missing = ROKKIT_PACKAGES.filter((p) => !allDeps[p])

	if (missing.length === 0) {
		console.info('  All Rokkit packages already installed')
		return
	}

	const pm = detectPackageManager(LOCKFILES.filter((f) => existsSync(resolve(cwd, f))))
	const { bin, args } = buildInstallCommand(pm, missing)
	const runInstall = adapters.runInstall ?? ((b, a) => execFileSync(b, a, { stdio: 'inherit' }))

	console.info(`  Installing ${missing.join(', ')} via ${pm}...`)
	runInstall(bin, args)
	console.info('  Packages installed')
}

const CHART_COLOR_SETS = {
	default: ['blue', 'emerald', 'rose', 'amber', 'violet', 'sky', 'pink', 'teal',
	          'orange', 'indigo', 'lime', 'cyan', 'gold', 'lavender'],
	warm:    ['rose', 'orange', 'amber', 'pink', 'red', 'yellow', 'gold', 'fuchsia'],
	cool:    ['sky', 'teal', 'blue', 'indigo', 'cyan', 'violet', 'lavender', 'slate']
}

const CHART_SHADE_PRESETS = {
	standard: { light: { fill: '300', stroke: '700' }, dark: { fill: '500', stroke: '200' } },
	high:     { light: { fill: '200', stroke: '800' }, dark: { fill: '400', stroke: '100' } },
	soft:     { light: { fill: '400', stroke: '600' }, dark: { fill: '600', stroke: '300' } }
}

// Base rgb skin — named-token roles only (no secondary/tertiary; ink defaults to surface).
const DEFAULT_SKIN_BASE = {
	primary: 'orange',
	accent: 'sky',
	surface: 'slate',
	success: 'green',
	warning: 'yellow',
	danger: 'red',
	error: 'red',
	info: 'cyan'
}

const SKIN_PRESETS = {
	default: {},
	vibrant: { primary: 'blue', accent: 'sky', surface: 'slate' },
	seaweed: {
		primary: 'sky',
		accent: 'blue',
		surface: 'zinc',
		danger: 'rose',
		error: 'rose',
		success: 'lime',
		warning: 'amber',
		info: 'indigo'
	}
}

/**
 * Resolve a named-token rgb skin from a preset or custom colors.
 * `ink` defaults to the `surface` palette. Only the named-token roles are
 * emitted; `secondary`/`tertiary` are intentionally omitted (no named token
 * reads them). A consumer who needs them can add them to their config's skin
 * directly — @rokkit/unocss's loadConfig merges extra roles through.
 * @param {string} palette
 * @param {Record<string, string>} [customColors]
 * @returns {Record<string, string>}
 */
function resolveSkin(palette, customColors) {
	const merged =
		palette === 'custom'
			? { ...DEFAULT_SKIN_BASE, ...customColors }
			: { ...DEFAULT_SKIN_BASE, ...(SKIN_PRESETS[palette] || {}) }
	return {
		surface: merged.surface,
		ink: merged.ink ?? merged.surface,
		primary: merged.primary,
		accent: merged.accent,
		success: merged.success,
		warning: merged.warning,
		danger: merged.danger,
		error: merged.error,
		info: merged.info
	}
}

// Zen-Sumi OKLCH palettes — bare "L C H" components (colorSpace: 'oklch').
const ZEN_SUMI_PALETTES = {
	kami: {
		50: '0.985 0.005 85', 100: '0.975 0.008 85', 200: '0.955 0.010 85',
		300: '0.920 0.012 85', 400: '0.850 0.010 70', 500: '0.750 0.008 50',
		600: '0.580 0.010 50', 700: '0.380 0.012 50', 800: '0.280 0.012 50',
		900: '0.220 0.012 50', 950: '0.170 0.010 50'
	},
	sumi: {
		50: '0.170 0.010 50', 100: '0.210 0.012 50', 200: '0.250 0.012 50',
		300: '0.320 0.012 50', 400: '0.420 0.010 50', 500: '0.570 0.010 50',
		600: '0.420 0.012 85', 700: '0.600 0.010 85', 800: '0.780 0.008 85',
		900: '0.940 0.008 85', 950: '0.975 0.008 85'
	},
	shu: {
		50: '0.970 0.020 35', 100: '0.940 0.040 35', 200: '0.880 0.070 35',
		300: '0.800 0.100 35', 400: '0.700 0.130 35', 500: '0.580 0.150 35',
		600: '0.500 0.140 35', 700: '0.420 0.120 35', 800: '0.350 0.100 35',
		900: '0.280 0.080 35', 950: '0.220 0.060 35'
	},
	hisui: {
		50: '0.970 0.015 160', 100: '0.940 0.030 160', 200: '0.880 0.050 160',
		300: '0.800 0.065 160', 400: '0.720 0.075 160', 500: '0.620 0.080 160',
		600: '0.540 0.075 160', 700: '0.460 0.065 160', 800: '0.380 0.055 160',
		900: '0.300 0.045 160', 950: '0.240 0.035 160'
	},
	kohaku: {
		50: '0.980 0.020 75', 100: '0.950 0.040 75', 200: '0.900 0.070 75',
		300: '0.850 0.095 75', 400: '0.790 0.110 75', 500: '0.720 0.120 75',
		600: '0.640 0.110 75', 700: '0.560 0.095 75', 800: '0.470 0.080 75',
		900: '0.380 0.065 75', 950: '0.300 0.050 75'
	}
}

/**
 * Build the chart config section from user prompt answers.
 * @param {{ chartColors: string, chartShades: string }} opts
 * @returns {Record<string, unknown>}
 */
export function generateChartConfig({ chartColors, chartShades }) {
	return {
		colors: CHART_COLOR_SETS[chartColors] ?? CHART_COLOR_SETS.default,
		shades: CHART_SHADE_PRESETS[chartShades] ?? CHART_SHADE_PRESETS.standard
	}
}

/**
 * Build the Zen-Sumi OKLCH starter (ink-on-paper, dual-palette dark mode).
 * @param {{ themes?: string[], defaultTheme?: string, switcher?: string,
 *   includeChart?: boolean, chartColors?: string, chartShades?: string,
 *   storageKey?: string }} [opts]
 * @returns {Record<string, unknown>}
 */
export function generateZenSumiConfig(opts = {}) {
	const { themes, defaultTheme, switcher, includeChart, chartColors, chartShades, storageKey } = opts
	const config = {
		palettes: ZEN_SUMI_PALETTES,
		colorSpace: 'oklch',
		tokens: 'core',
		skin: {
			surface: { light: 'kami', dark: 'sumi' },
			ink: { light: 'kami', dark: 'sumi' },
			primary: 'shu',
			accent: 'shu',
			success: 'hisui',
			warning: 'kohaku',
			danger: 'shu',
			error: 'shu',
			info: 'kohaku'
		},
		shape: { radius: 'soft' },
		typography: {
			display: "'Fraunces', 'Iowan Old Style', Georgia, serif",
			sans: "'Inter', system-ui, -apple-system, sans-serif",
			mono: "'JetBrains Mono', 'SF Mono', Menlo, monospace"
		},
		themes: themes && themes.length ? themes : ['rokkit', 'zen-sumi'],
		defaultTheme: defaultTheme || 'zen-sumi',
		switcher: switcher || 'full',
		...(storageKey ? { storageKey } : {})
	}
	if (includeChart) config.chart = generateChartConfig({ chartColors, chartShades })
	return config
}

/**
 * Build a Rokkit config object from the user's init choices.
 * Emits the named-token `skin` shape (skin + colorSpace + tokens), plus
 * optional `icons` and `chart` sections.
 * @param {{ palette: string, customColors?: Record<string, string>, icons?: string,
 *   iconPath?: string, iconStyle?: string, themes: string[], defaultTheme?: string,
 *   switcher: string, includeChart?: boolean, chartColors?: string, chartShades?: string,
 *   storageKey?: string }} opts
 * @returns {Record<string, unknown>}
 */
export function generateConfig({
	palette,
	customColors,
	icons,
	iconPath,
	iconStyle,
	themes,
	defaultTheme,
	switcher,
	includeChart,
	chartColors,
	chartShades,
	storageKey
}) {
	if (palette === 'zen-sumi') {
		return generateZenSumiConfig({ themes, defaultTheme, switcher, includeChart, chartColors, chartShades, storageKey })
	}

	const config = {
		skin: resolveSkin(palette, customColors),
		colorSpace: 'rgb',
		tokens: 'core',
		shape: { radius: 'soft' },
		themes,
		defaultTheme: defaultTheme || themes[0],
		switcher,
		...(storageKey ? { storageKey } : {})
	}

	const iconConfig = {}
	if (iconStyle) iconConfig.style = iconStyle
	if (icons === 'custom' && iconPath) iconConfig.custom = iconPath
	if (Object.keys(iconConfig).length > 0) config.icons = iconConfig

	if (includeChart) {
		config.chart = generateChartConfig({ chartColors, chartShades })
	}

	return config
}

/**
 * Generate the content for uno.config.js.
 * @returns {string}
 */
export function generateUnoConfig() {
	return `import { defineConfig, transformerDirectives } from 'unocss'
import { presetRokkit } from '@rokkit/unocss'
import config from './rokkit.config.js'

export default defineConfig({
  transformers: [transformerDirectives()],
  presets: [presetRokkit(config)]
})
`
}

/**
 * Generate an array of CSS @import lines for app.css.
 * @param {string[]} themes
 * @returns {string[]}
 */
export function generateAppCssImports(themes) {
	const lines = ["@import '@unocss/reset/tailwind.css';", "@import '@rokkit/themes/base.css';"]
	for (const theme of themes) {
		lines.push(`@import '@rokkit/themes/${theme}.css';`)
	}
	return lines
}

const PROMPTS_CONFIG = [
	{
		type: 'select',
		name: 'palette',
		message: 'Color palette',
		choices: [
			{ title: 'Default (orange/pink/sky)', value: 'default' },
			{ title: 'Vibrant (blue/purple/sky)', value: 'vibrant' },
			{ title: 'Seaweed (sky/green/blue)', value: 'seaweed' },
			{ title: 'Zen-Sumi (OKLCH ink-on-paper)', value: 'zen-sumi' },
			{ title: 'Custom', value: 'custom' }
		]
	},
	{
		type: (prev) => (prev === 'custom' ? 'text' : null),
		name: 'primary',
		message: 'Primary color (Tailwind palette name)',
		initial: 'orange'
	},
	{
		type: (_, values) => (values.palette === 'custom' ? 'text' : null),
		name: 'accent',
		message: 'Accent color',
		initial: 'sky'
	},
	{
		type: (_, values) => (values.palette === 'custom' ? 'text' : null),
		name: 'surface',
		message: 'Surface color',
		initial: 'slate'
	},
	{
		type: 'select',
		name: 'iconStyle',
		message: 'Icon style',
		choices: [
			{ title: 'Default (duotone)', value: undefined },
			{ title: 'Solid', value: 'solid' },
			{ title: 'Outline', value: 'outline' },
			{ title: 'Duotone outline', value: 'duotone-outline' }
		]
	},
	{
		type: 'select',
		name: 'icons',
		message: 'Icon collections',
		choices: [
			{ title: 'Rokkit icons only', value: 'rokkit' },
			{ title: 'Rokkit + custom collection', value: 'custom' }
		]
	},
	{
		type: (prev) => (prev === 'custom' ? 'text' : null),
		name: 'iconPath',
		message: 'Path to custom icon collection JSON',
		initial: './static/icons/custom.json'
	},
	{
		type: 'multiselect',
		name: 'themes',
		message: 'Theme styles',
		choices: [
			{ title: 'Rokkit', value: 'rokkit', selected: true },
			{ title: 'Minimal', value: 'minimal', hint: 'clean + subtle' },
			{ title: 'Material', value: 'material', hint: 'elevation + shadows' },
			{ title: 'Frosted', value: 'frosted', hint: 'frosted glass + blur' },
			{ title: 'Zen-Sumi', value: 'zen-sumi', hint: 'ink on paper' }
		],
		min: 1
	},
	{
		type: (prev) => (prev?.length > 1 ? 'select' : null),
		name: 'defaultTheme',
		message: 'Default theme style',
		choices: (prev) =>
			prev.map((t) => ({ title: t.charAt(0).toUpperCase() + t.slice(1), value: t }))
	},
	{
		type: 'select',
		name: 'switcher',
		message: 'Theme switching',
		choices: [
			{ title: 'System only (prefers-color-scheme)', value: 'system' },
			{ title: 'Manual (light/dark toggle)', value: 'manual' },
			{ title: 'Full (light/dark + style variants)', value: 'full' }
		]
	},
	{
		type: 'confirm',
		name: 'includeChart',
		message: 'Include chart configuration?',
		initial: true
	},
	{
		type: (prev) => (prev ? 'select' : null),
		name: 'chartColors',
		message: 'Chart color set',
		choices: [
			{ title: 'Default series (blue/emerald/rose/amber…)', value: 'default' },
			{ title: 'Warm (rose/orange/amber/pink…)', value: 'warm' },
			{ title: 'Cool (sky/teal/blue/indigo…)', value: 'cool' }
		]
	},
	{
		type: (_, values) => (values.includeChart ? 'select' : null),
		name: 'chartShades',
		message: 'Shade contrast',
		choices: [
			{ title: 'Standard (fill 300 / stroke 700)', value: 'standard' },
			{ title: 'High (fill 200 / stroke 800)', value: 'high' },
			{ title: 'Soft (fill 400 / stroke 600)', value: 'soft' }
		]
	}
]

/**
 * Write rokkit.config.js
 * @param {string} cwd
 * @param {Record<string, unknown>} config
 */
function writeRokkitConfig(cwd, config) {
	const configPath = resolve(cwd, 'rokkit.config.js')
	if (existsSync(configPath)) {
		console.warn('  rokkit.config.js already exists — skipping')
		return
	}
	writeFileSync(configPath, serializeRokkitConfig(config))
	console.info('  Created rokkit.config.js')
}

/**
 * Write uno.config.js
 * @param {string} cwd
 */
function writeUnoConfig(cwd) {
	const unoPath = resolve(cwd, 'uno.config.js')
	if (existsSync(unoPath)) {
		console.warn('  uno.config.js already exists — skipping (see rokkit doctor for migration)')
		return
	}
	writeFileSync(unoPath, generateUnoConfig())
	console.info('  Created uno.config.js')
}

/**
 * Patch or create app.css
 * @param {string} cwd
 * @param {string[]} cssImports
 */
function writeAppCss(cwd, cssImports) {
	const appCssPath = resolve(cwd, 'src/app.css')
	if (!existsSync(appCssPath)) {
		writeFileSync(appCssPath, `${cssImports.join('\n')}\n`)
		console.info('  Created src/app.css')
		return
	}
	const existing = readFileSync(appCssPath, 'utf-8')
	const missing = cssImports.filter((line) => !existing.includes(line))
	if (missing.length > 0) {
		writeFileSync(appCssPath, `${missing.join('\n')}\n${existing}`)
		console.info(`  Patched app.css — added ${missing.length} imports`)
	} else {
		console.info('  app.css already has theme imports')
	}
}

/**
 * Patch app.html with init script
 * @param {string} cwd
 * @param {string} initScript
 * @param {string} storageKey
 */
function writeAppHtml(cwd, initScript, storageKey) {
	const appHtmlPath = resolve(cwd, 'src/app.html')
	if (!existsSync(appHtmlPath)) return
	const html = readFileSync(appHtmlPath, 'utf-8')
	if (html.includes('rokkit-theme') || html.includes(storageKey)) {
		console.info('  app.html already has init script')
		return
	}
	const patched = html.replace(/(<body[^>]*>)/, `$1\n${initScript}`)
	writeFileSync(appHtmlPath, patched)
	console.info('  Patched app.html — added theme init script')
}

/**
 * Interactive init command — prompts the user, writes config files.
 * @param {Record<string, unknown>} [_opts]
 * @param {{ runInstall?: (bin: string, args: string[]) => void }} [adapters] — injectable for testing
 */
// eslint-disable-next-line max-lines-per-function
export async function init(_opts = {}, adapters = {}) {
	const cwd = process.cwd()

	// Detect SvelteKit project
	if (!detectSvelteKit(cwd)) {
		console.warn('No svelte.config.js found — this may not be a SvelteKit project.')
		const { proceed } = await prompts({
			type: 'confirm',
			name: 'proceed',
			message: 'Continue anyway?',
			initial: false
		})
		if (!proceed) return
	}

	console.info('Rokkit Init — Setting up your SvelteKit project\n')

	// Install packages
	installPackages(cwd, adapters)

	const response = await prompts(PROMPTS_CONFIG)

	if (response.palette === 'custom') {
		response.customColors = {
			primary: response.primary,
			accent: response.accent,
			surface: response.surface
		}
	}

	let appName
	try {
		appName = JSON.parse(readFileSync(resolve(cwd, 'package.json'), 'utf-8')).name
	} catch {
		appName = undefined
	}
	response.storageKey = storageKeyFromName(appName)

	const config = generateConfig(response)

	writeRokkitConfig(cwd, config)
	writeUnoConfig(cwd)
	writeAppCss(cwd, generateAppCssImports(config.themes))

	const initScript = themeInitScript({ storageKey: config.storageKey, defaultStyle: config.defaultTheme })
	if (initScript) writeAppHtml(cwd, initScript, config.storageKey)

	console.info('\nDone! Run `rokkit doctor` to verify your setup.')
}

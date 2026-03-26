/* eslint-disable no-console */
import prompts from 'prompts'
import { writeFileSync, readFileSync, existsSync } from 'fs'
import { resolve } from 'path'

const SKIN_PRESETS = {
	default: { primary: 'orange', secondary: 'pink', accent: 'sky', surface: 'slate' },
	vibrant: { primary: 'blue', secondary: 'purple', accent: 'sky', surface: 'slate' },
	seaweed: {
		primary: 'sky',
		secondary: 'green',
		accent: 'blue',
		surface: 'zinc',
		danger: 'rose',
		error: 'rose',
		success: 'lime',
		warning: 'amber',
		info: 'indigo'
	}
}

const DEFAULT_COLORS = {
	primary: 'orange',
	secondary: 'pink',
	accent: 'sky',
	surface: 'slate',
	success: 'green',
	warning: 'yellow',
	danger: 'red',
	error: 'red',
	info: 'cyan'
}

/**
 * Generate a Rokkit config object from user choices.
 * @param {{ palette: string, customColors?: Record<string, string>, icons: string, iconPath?: string, themes: string[], switcher: string }} opts
 * @returns {Record<string, unknown>}
 */
function resolveColors(palette, customColors) {
	if (palette === 'custom') return { ...DEFAULT_COLORS, ...customColors }
	return { ...DEFAULT_COLORS, ...(SKIN_PRESETS[palette] || {}) }
}

export function generateConfig({ palette, customColors, icons, iconPath, themes, defaultTheme, switcher }) {
	const config = {
		colors: resolveColors(palette, customColors),
		themes,
		defaultTheme: defaultTheme || themes[0],
		switcher,
		storageKey: 'rokkit-theme'
	}

	if (icons === 'custom' && iconPath) {
		config.icons = { custom: iconPath }
	}

	return config
}

/**
 * Generate the content for uno.config.js.
 * @returns {string}
 */
export function generateUnoConfig() {
	return `import { defineConfig } from 'unocss'
import { presetRokkit } from '@rokkit/unocss'
import config from './rokkit.config.js'

export default defineConfig({
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

/**
 * Generate the flash-prevention script for app.html.
 * Returns null when no script is needed (system switcher).
 * @param {string} switcher — 'system' | 'manual' | 'full'
 * @param {string} [storageKey='rokkit-theme']
 * @returns {string | null}
 */
export function generateInitScript(switcher, storageKey = 'rokkit-theme', defaultStyle = 'rokkit') {
	if (switcher === 'system') return null

	const setStyle = switcher === 'full' ? `b.dataset.style = t.style || '${defaultStyle}'\n          ` : ''

	return `    <script>
      (function () {
        try {
          var t = JSON.parse(localStorage.getItem('${storageKey}') || '{}')
          var b = document.body
          ${setStyle}b.dataset.mode = t.mode || 'dark'
        } catch (e) {}
      })()
    </script>`
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
		name: 'secondary',
		message: 'Secondary color',
		initial: 'pink'
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
			{ title: 'Minimal', value: 'minimal' },
			{ title: 'Material', value: 'material' },
			{ title: 'Glass', value: 'glass' },
			{ title: 'Grada UI', value: 'grada-ui' },
			{ value: 'shadcn', title: 'shadcn', hint: 'flat borders + ring focus' },
			{ value: 'daisy-ui', title: 'daisy-ui', hint: 'rounded-full + bold fills' },
			{ value: 'bits-ui', title: 'bits-ui', hint: 'rounded-lg + polished' },
			{ value: 'carbon', title: 'carbon', hint: 'square edges + enterprise' },
			{ value: 'ant-design', title: 'ant-design', hint: 'thin borders + dense' }
		],
		min: 1
	},
	{
		type: (prev) => (prev?.length > 1 ? 'select' : null),
		name: 'defaultTheme',
		message: 'Default theme style',
		choices: (prev) => prev.map((t) => ({ title: t.charAt(0).toUpperCase() + t.slice(1), value: t }))
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
	writeFileSync(configPath, `export default ${JSON.stringify(config, null, 2)}\n`)
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
 */
export async function init() {
	console.info('Rokkit Init — Setting up your SvelteKit project\n')

	const response = await prompts(PROMPTS_CONFIG)

	if (response.palette === 'custom') {
		response.customColors = {
			primary: response.primary,
			secondary: response.secondary,
			accent: response.accent,
			surface: response.surface
		}
	}

	const config = generateConfig(response)
	const cwd = process.cwd()

	writeRokkitConfig(cwd, config)
	writeUnoConfig(cwd)
	writeAppCss(cwd, generateAppCssImports(config.themes))

	const initScript = generateInitScript(config.switcher, config.storageKey, config.defaultTheme)
	if (initScript) writeAppHtml(cwd, initScript, config.storageKey)

	console.info('\nDone! Run `rokkit doctor` to verify your setup.')
}

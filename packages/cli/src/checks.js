/**
 * The `doctor` checks: one function per project-setup requirement, plus
 * `runChecks` which runs them all against a filesystem adapter.
 */
import { generateUnoConfig } from './init.js'

const KNOWN_THEMES = [
	'rokkit',
	'minimal',
	'material',
	'frosted',
	'zen-sumi'
]

/**
 * Check config file existence
 * @param {Object} fs
 * @returns {{ id: string, label: string, status: string, fixable: boolean, fix: string, autoFix: string }}
 */
function checkConfig(fs) {
	const configExists = fs.exists(fs.resolve('rokkit.config.js'))
	return {
		id: 'config-exists',
		label: 'rokkit.config.js exists',
		status: configExists ? 'pass' : 'fail',
		fixable: true,
		fix: 'Run `rokkit init` to generate config',
		autoFix: 'generate-config'
	}
}

/**
 * Check uno.config.js uses presetRokkit
 * @param {Object} fs
 * @returns {Object}
 */
function checkUnoPreset(fs) {
	const unoPath = fs.resolve('uno.config.js')
	const unoExists = fs.exists(unoPath)
	const unoContent = unoExists ? fs.read(unoPath) : ''
	const unoUsesPreset = unoContent.includes('presetRokkit') && unoContent.includes('rokkit.config')
	return {
		id: 'uno-uses-preset',
		label: 'uno.config.js uses presetRokkit(config)',
		status: unoUsesPreset ? 'pass' : 'fail',
		fixable: false,
		fix: unoExists
			? `Replace uno.config.js contents with:\n${generateUnoConfig()}`
			: `Create uno.config.js with:\n${generateUnoConfig()}`
	}
}

/**
 * Check app.css has theme imports
 * @param {Object} fs
 * @returns {Object}
 */
function checkCssImports(fs) {
	const cssPath = fs.resolve('src/app.css')
	const cssExists = fs.exists(cssPath)
	const cssHasBase = cssExists && fs.read(cssPath).includes('@rokkit/themes/base.css')
	return {
		id: 'css-imports',
		label: 'app.css imports @rokkit/themes/base.css',
		status: cssHasBase ? 'pass' : 'fail',
		fixable: true,
		fix: 'Append base theme import to src/app.css',
		autoFix: 'patch-css'
	}
}

/**
 * Check app.css has at least one theme style
 * @param {Object} fs
 * @returns {Object}
 */
function checkCssTheme(fs) {
	const cssPath = fs.resolve('src/app.css')
	const cssExists = fs.exists(cssPath)
	const css = cssExists ? fs.read(cssPath) : ''
	const hasTheme = KNOWN_THEMES.some((t) => css.includes(`@rokkit/themes/${t}.css`))
	return {
		id: 'css-theme',
		label: 'app.css has a theme style',
		status: hasTheme ? 'pass' : 'warn',
		fixable: false,
		fix: `Add a theme import to src/app.css, e.g. @import '@rokkit/themes/rokkit.css'\n         Available: ${KNOWN_THEMES.join(', ')}, or use a custom theme`
	}
}

/**
 * Check rokkit.config.js has a chart section.
 * Missing chart config is a warning (not failure) — defaults work without it.
 * @param {Object} fs
 * @returns {Object}
 */
function checkChartConfig(fs) {
	const configPath = fs.resolve('rokkit.config.js')
	const configExists = fs.exists(configPath)
	const hasChart = configExists && /\bchart\s*:/.test(fs.read(configPath))
	return {
		id: 'chart-config',
		label: 'rokkit.config.js has chart configuration',
		status: hasChart ? 'pass' : 'warn',
		fixable: configExists,
		fix: 'Add a chart section to rokkit.config.js (see docs/design/17-chart-preset.md)',
		autoFix: 'patch-chart-config'
	}
}

/**
 * Check app.html has init script
 * @param {Object} fs
 * @returns {Object}
 */
function checkHtmlScript(fs) {
	const htmlPath = fs.resolve('src/app.html')
	const htmlExists = fs.exists(htmlPath)
	const htmlHasScript =
		htmlExists &&
		(fs.read(htmlPath).includes('rokkit-theme') || fs.read(htmlPath).includes('data-mode'))
	return {
		id: 'html-init-script',
		label: 'app.html has theme init script',
		status: htmlHasScript ? 'pass' : 'fail',
		fixable: true,
		fix: 'Add flash-prevention script to src/app.html',
		autoFix: 'patch-html'
	}
}

/**
 * Run all doctor checks against the given filesystem adapter.
 * @param {{ exists: (p: string) => boolean, read: (p: string) => string, resolve: (p: string) => string }} fs
 * @returns {Array<{ id: string, label: string, status: 'pass'|'fail', fixable: boolean, fix: string, autoFix?: string }>}
 */
export function runChecks(fs) {
	return [
		checkConfig(fs),
		checkUnoPreset(fs),
		checkCssImports(fs),
		checkCssTheme(fs),
		checkHtmlScript(fs),
		checkChartConfig(fs)
	]
}

/* eslint-disable no-console */
import { existsSync, readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'
import { generateUnoConfig, generateAppCssImports, generateInitScript, generateChartConfig } from './init.js'

const KNOWN_THEMES = [
	'rokkit',
	'minimal',
	'material',
	'frosted',
	'grada-ui',
	'shadcn',
	'daisy-ui',
	'bits-ui',
	'carbon',
	'ant-design'
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

/**
 * Create a real filesystem adapter rooted at cwd.
 * @param {string} cwd
 */
function createFsAdapter(cwd) {
	return {
		exists: (p) => existsSync(p),
		read: (p) => readFileSync(p, 'utf-8'),
		resolve: (p) => resolve(cwd, p)
	}
}

/**
 * Apply the generate-config fix
 * @param {string} cwd
 * @param {string} label
 */
function applyGenerateConfig(cwd, label) {
	const configPath = resolve(cwd, 'rokkit.config.js')
	writeFileSync(configPath, 'export default {}\n')
	console.info(`  Fixed: ${label}`)
}

/**
 * Apply the patch-css fix
 * @param {string} cwd
 * @param {string} label
 */
function applyPatchCss(cwd, label) {
	const cssPath = resolve(cwd, 'src/app.css')
	const imports = generateAppCssImports([])
	if (existsSync(cssPath)) {
		const existing = readFileSync(cssPath, 'utf-8')
		const missing = imports.filter((line) => !existing.includes(line))
		if (missing.length > 0) writeFileSync(cssPath, `${missing.join('\n')}\n${existing}`)
	} else {
		writeFileSync(cssPath, `${imports.join('\n')}\n`)
	}
	console.info(`  Fixed: ${label}`)
}

/**
 * Apply the patch-html fix
 * @param {string} cwd
 * @param {string} label
 * @returns {boolean} whether fix was applied
 */
function applyPatchHtml(cwd, label) {
	const htmlPath = resolve(cwd, 'src/app.html')
	if (!existsSync(htmlPath)) return false
	const html = readFileSync(htmlPath, 'utf-8')
	const script = generateInitScript('manual', 'rokkit-theme')
	if (!script || html.includes('rokkit-theme')) return false
	const patched = html.replace(/(<body[^>]*>)/, `$1\n${script}`)
	writeFileSync(htmlPath, patched)
	console.info(`  Fixed: ${label}`)
	return true
}

/**
 * Patch rokkit.config.js to add a default chart section.
 * @param {string} cwd
 * @param {string} label
 */
function applyPatchChartConfig(cwd, label) {
	const configPath = resolve(cwd, 'rokkit.config.js')
	if (!existsSync(configPath)) return false
	const content = readFileSync(configPath, 'utf-8')
	if (/\bchart\s*:/.test(content)) return false
	const chartConfig = generateChartConfig({ chartColors: 'default', chartShades: 'standard' })
	const chartJson = JSON.stringify(chartConfig, null, 2).replace(/\n/g, '\n  ')
	// Inject before the last closing brace of the export default object
	const patched = content.replace(/(\n?}\s*\n?)$/, `,\n  chart: ${chartJson}\n}\n`)
	writeFileSync(configPath, patched)
	console.info(`  Fixed: ${label}`)
	return true
}

/** @type {Record<string, (cwd: string, label: string) => boolean|void>} */
const FIX_HANDLERS = {
	'generate-config': (cwd, label) => {
		applyGenerateConfig(cwd, label)
		return true
	},
	'patch-css': (cwd, label) => {
		applyPatchCss(cwd, label)
		return true
	},
	'patch-html': (cwd, label) => applyPatchHtml(cwd, label),
	'patch-chart-config': (cwd, label) => applyPatchChartConfig(cwd, label)
}

/**
 * @param {number} fixed
 * @param {{ status: string, fixable: boolean, autoFix?: string, label: string }} check
 * @param {string} cwd
 * @returns {number}
 */
function applyCheckFix(fixed, check, cwd) {
	if (check.status !== 'fail' || !check.fixable) return fixed
	const handler = FIX_HANDLERS[check.autoFix]
	return handler && handler(cwd, check.label) ? fixed + 1 : fixed
}

/**
 * Auto-fix failed checks that are marked fixable.
 * @param {Array<{ id: string, status: string, fixable: boolean, autoFix?: string, label: string }>} checks
 * @param {string} cwd
 * @returns {number} number of fixed items
 */
function autoFix(checks, cwd) {
	return checks.reduce((fixed, check) => applyCheckFix(fixed, check, cwd), 0)
}

/**
 * Print fix hints for failing checks
 * @param {Array} checks
 */
function printFixHints(checks) {
	for (const check of checks) {
		if (check.status === 'fail' || check.status === 'warn') {
			console.info(`         ${check.fixable ? '(auto-fixable) ' : ''}${check.fix}`)
		}
	}
}

/**
 * Print remaining manual action items
 * @param {Array} checks
 */
function printManualItems(checks) {
	for (const check of checks) {
		if (check.status === 'fail' && !check.fixable) {
			console.info(`  - ${check.label}: ${check.fix}`)
		}
	}
}

/**
 * Count failures and print status for each check.
 * @param {Array} checks
 * @returns {number}
 */
function printChecks(checks) {
	let failures = 0
	for (const check of checks) {
		const icon = check.status === 'pass' ? 'PASS' : check.status === 'warn' ? 'WARN' : 'FAIL'
		console.info(`  ${icon}  ${check.label}`)
		if (check.status === 'fail') failures++
	}
	return failures
}

/**
 * Handle auto-fix flow and print results.
 * @param {Array} checks
 * @param {string} cwd
 * @param {number} failures
 */
function handleAutoFix(checks, cwd, failures) {
	console.info('\nAuto-fixing...\n')
	const fixed = autoFix(checks, cwd)
	const remaining = failures - fixed
	if (remaining > 0) {
		console.info(`\n${fixed} fixed, ${remaining} require manual action:`)
		printManualItems(checks)
	} else {
		console.info(`\nAll ${fixed} issues fixed!`)
	}
}

/**
 * @param {Array} checks
 * @param {string} cwd
 * @param {number} failures
 * @param {boolean} fix
 */
function handleResults(checks, cwd, failures, fix) {
	if (failures === 0) return
	if (fix) {
		handleAutoFix(checks, cwd, failures)
	} else {
		printFixHints(checks)
		process.exitCode = 1
	}
}

/**
 * Interactive doctor command — validates project setup.
 * @param {{ fix?: boolean }} [opts]
 */
export function doctor(opts = {}) {
	const cwd = process.cwd()
	const checks = runChecks(createFsAdapter(cwd))

	console.info('Rokkit Doctor\n')
	const failures = printChecks(checks)
	handleResults(checks, cwd, failures, opts.fix ?? false)
	console.info('')
}

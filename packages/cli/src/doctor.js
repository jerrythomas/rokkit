/* eslint-disable no-console */
import { existsSync, readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'
import { generateUnoConfig, generateAppCssImports, generateInitScript } from './init.js'

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
	const unoUsesPreset = unoExists && fs.read(unoPath).includes('presetRokkit')
	return {
		id: 'uno-uses-preset',
		label: 'uno.config.js uses presetRokkit()',
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
	const cssHasBase = cssExists && fs.read(cssPath).includes('@rokkit/themes/dist/base')
	return {
		id: 'css-imports',
		label: 'app.css has theme imports',
		status: cssHasBase ? 'pass' : 'fail',
		fixable: true,
		fix: 'Append theme imports to src/app.css',
		autoFix: 'patch-css'
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
	return [checkConfig(fs), checkUnoPreset(fs), checkCssImports(fs), checkHtmlScript(fs)]
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
	const imports = generateAppCssImports(['rokkit'])
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
	'patch-html': (cwd, label) => applyPatchHtml(cwd, label)
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
		if (check.status === 'fail') {
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
		const icon = check.status === 'pass' ? 'PASS' : 'FAIL'
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

/* eslint-disable no-console */
import { existsSync, readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'
import { generateUnoConfig, generateAppCssImports, generateInitScript } from './init.js'

/**
 * Run all doctor checks against the given filesystem adapter.
 * @param {{ exists: (p: string) => boolean, read: (p: string) => string, resolve: (p: string) => string }} fs
 * @returns {Array<{ id: string, label: string, status: 'pass'|'fail', fixable: boolean, fix: string, autoFix?: string }>}
 */
export function runChecks(fs) {
	const checks = []

	// 1. rokkit.config.js exists
	const configExists = fs.exists(fs.resolve('rokkit.config.js'))
	checks.push({
		id: 'config-exists',
		label: 'rokkit.config.js exists',
		status: configExists ? 'pass' : 'fail',
		fixable: true,
		fix: 'Run `rokkit init` to generate config',
		autoFix: 'generate-config'
	})

	// 2. uno.config.js uses presetRokkit
	const unoPath = fs.resolve('uno.config.js')
	const unoExists = fs.exists(unoPath)
	let unoUsesPreset = false
	if (unoExists) {
		const unoContent = fs.read(unoPath)
		unoUsesPreset = unoContent.includes('presetRokkit')
	}
	checks.push({
		id: 'uno-uses-preset',
		label: 'uno.config.js uses presetRokkit()',
		status: unoUsesPreset ? 'pass' : 'fail',
		fixable: false,
		fix: unoExists
			? `Replace uno.config.js contents with:\n${  generateUnoConfig()}`
			: `Create uno.config.js with:\n${  generateUnoConfig()}`
	})

	// 3. app.css has theme imports
	const cssPath = fs.resolve('src/app.css')
	const cssExists = fs.exists(cssPath)
	let cssHasBase = false
	if (cssExists) {
		const css = fs.read(cssPath)
		cssHasBase = css.includes('@rokkit/themes/dist/base')
	}
	checks.push({
		id: 'css-imports',
		label: 'app.css has theme imports',
		status: cssHasBase ? 'pass' : 'fail',
		fixable: true,
		fix: 'Append theme imports to src/app.css',
		autoFix: 'patch-css'
	})

	// 4. app.html has init script
	const htmlPath = fs.resolve('src/app.html')
	const htmlExists = fs.exists(htmlPath)
	let htmlHasScript = false
	if (htmlExists) {
		const html = fs.read(htmlPath)
		htmlHasScript = html.includes('rokkit-theme') || html.includes('data-mode')
	}
	checks.push({
		id: 'html-init-script',
		label: 'app.html has theme init script',
		status: htmlHasScript ? 'pass' : 'fail',
		fixable: true,
		fix: 'Add flash-prevention script to src/app.html',
		autoFix: 'patch-html'
	})

	return checks
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
 * Auto-fix failed checks that are marked fixable.
 * @param {Array<{ id: string, status: string, fixable: boolean, autoFix?: string }>} checks
 * @param {string} cwd
 * @returns {number} number of fixed items
 */
function autoFix(checks, cwd) {
	let fixed = 0

	for (const check of checks) {
		if (check.status !== 'fail' || !check.fixable) continue

		if (check.autoFix === 'generate-config') {
			const configPath = resolve(cwd, 'rokkit.config.js')
			writeFileSync(configPath, 'export default {}\n')
			console.info(`  Fixed: ${check.label}`)
			fixed++
		}

		if (check.autoFix === 'patch-css') {
			const cssPath = resolve(cwd, 'src/app.css')
			const imports = generateAppCssImports(['rokkit'])
			if (existsSync(cssPath)) {
				const existing = readFileSync(cssPath, 'utf-8')
				const missing = imports.filter((line) => !existing.includes(line))
				if (missing.length > 0) {
					writeFileSync(cssPath, `${missing.join('\n')  }\n${  existing}`)
				}
			} else {
				writeFileSync(cssPath, `${imports.join('\n')  }\n`)
			}
			console.info(`  Fixed: ${check.label}`)
			fixed++
		}

		if (check.autoFix === 'patch-html') {
			const htmlPath = resolve(cwd, 'src/app.html')
			if (existsSync(htmlPath)) {
				const html = readFileSync(htmlPath, 'utf-8')
				const script = generateInitScript('manual', 'rokkit-theme')
				if (script && !html.includes('rokkit-theme')) {
					const patched = html.replace(/(<body[^>]*>)/, `$1\n${script}`)
					writeFileSync(htmlPath, patched)
					console.info(`  Fixed: ${check.label}`)
					fixed++
				}
			}
		}
	}

	return fixed
}

/**
 * Interactive doctor command — validates project setup.
 * @param {{ fix?: boolean }} [opts]
 */
export async function doctor(opts = {}) {
	const cwd = process.cwd()
	const fs = createFsAdapter(cwd)
	const checks = runChecks(fs)

	console.info('Rokkit Doctor\n')

	let failures = 0
	for (const check of checks) {
		const icon = check.status === 'pass' ? 'PASS' : 'FAIL'
		console.info(`  ${icon}  ${check.label}`)
		if (check.status === 'fail') {
			failures++
			if (!opts.fix) {
				console.info(`         ${check.fixable ? '(auto-fixable) ' : ''}${check.fix}`)
			}
		}
	}

	if (failures > 0 && opts.fix) {
		console.info('\nAuto-fixing...\n')
		const fixed = autoFix(checks, cwd)
		const remaining = failures - fixed
		if (remaining > 0) {
			console.info(`\n${fixed} fixed, ${remaining} require manual action:`)
			for (const check of checks) {
				if (check.status === 'fail' && !check.fixable) {
					console.info(`  - ${check.label}: ${check.fix}`)
				}
			}
		} else {
			console.info(`\nAll ${fixed} issues fixed!`)
		}
	}

	console.info('')
	process.exitCode = failures > 0 && !opts.fix ? 1 : 0
}

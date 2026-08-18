/* eslint-disable no-console */
/**
 * The filesystem adapter and auto-fix machinery behind `doctor --fix`:
 * apply each fix handler for a failed check and count what was fixed.
 */
import { existsSync, readFileSync, writeFileSync, readdirSync } from 'fs'
import { resolve, join } from 'path'
import {
	generateAppCssImports,
	generateChartConfig,
	generateConfig,
	serializeRokkitConfig
} from './init.js'
import { themeInitScript } from '@rokkit/unocss/hooks'

/**
 * Build the default named-token starter config source used by `doctor --fix`.
 * @returns {string}
 */
export function defaultStarterSource() {
	const config = generateConfig({
		palette: 'default',
		icons: 'rokkit',
		themes: ['rokkit'],
		switcher: 'manual',
		includeChart: true,
		chartColors: 'default',
		chartShades: 'standard'
	})
	return serializeRokkitConfig(config)
}

const SKIP_DIRS = new Set(['node_modules', '.svelte-kit', 'dist', '.git', 'coverage'])

/**
 * Recursively list absolute file paths under `dir`, skipping vendored/build dirs.
 * @param {string} dir
 * @returns {string[]}
 */
function listFiles(dir) {
	const out = []
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		if (entry.isDirectory()) {
			if (SKIP_DIRS.has(entry.name)) continue
			out.push(...listFiles(join(dir, entry.name)))
		} else {
			out.push(join(dir, entry.name))
		}
	}
	return out
}

/**
 * Create a real filesystem adapter rooted at cwd.
 * @param {string} cwd
 */
export function createFsAdapter(cwd) {
	return {
		exists: (p) => existsSync(p),
		read: (p) => readFileSync(p, 'utf-8'),
		resolve: (p) => resolve(cwd, p),
		list: (dir) => listFiles(dir)
	}
}

/**
 * Apply the generate-config fix
 * @param {string} cwd
 * @param {string} label
 */
function applyGenerateConfig(cwd, label) {
	const configPath = resolve(cwd, 'rokkit.config.js')
	writeFileSync(configPath, defaultStarterSource())
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
	// Use the project's configured storageKey so the injected script reads the
	// same localStorage slot the app persists to — don't hardcode a key.
	const configPath = resolve(cwd, 'rokkit.config.js')
	const storageKey = existsSync(configPath)
		? readFileSync(configPath, 'utf-8').match(/storageKey:\s*['"]([^'"]+)['"]/)?.[1]
		: undefined
	const marker = storageKey || 'rokkit-theme'
	if (html.includes(marker)) return false
	const script = themeInitScript({ storageKey })
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
/* v8 ignore next 16 -- chart-config check emits 'warn' (not 'fail'); applyCheckFix
   only processes 'fail' statuses, making this handler unreachable via the normal
   fix flow. Kept for potential future use if the check severity changes. */
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
export function autoFix(checks, cwd) {
	return checks.reduce((fixed, check) => applyCheckFix(fixed, check, cwd), 0)
}

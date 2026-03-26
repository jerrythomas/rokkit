/* eslint-disable no-console */
import { writeFileSync, existsSync, mkdirSync, readdirSync } from 'fs'
import { resolve, join } from 'path'
import { loadConfig } from './config.js'

/**
 * All component names that ship with Rokkit — one CSS block will be generated for each.
 */
export const THEME_COMPONENTS = [
	'button',
	'card',
	'connector',
	'dropdown',
	'floating-action',
	'floating-navigation',
	'grid',
	'input',
	'list',
	'menu',
	'message',
	'range',
	'search-filter',
	'select',
	'status-list',
	'switch',
	'table',
	'tabs',
	'timeline',
	'toc',
	'toggle',
	'toolbar',
	'tree',
	'upload-progress',
	'upload-target'
]

/**
 * Generate a full CSS theme stub for the given style name.
 * Produces one `[data-style='<name>']` block per component.
 * @param {string} name
 * @returns {string}
 */
export function generateThemeStub(name) {
	const header = `/* Custom theme: ${name} */
/* Apply this theme with: <body data-style="${name}"> */
/* Customize each component block below using CSS custom properties and UnoCSS utilities. */
/* Reference: https://rokkit.dev/docs/theming */

`
	const blocks = THEME_COMPONENTS.map((component) => {
		const selector = `[data-style='${name}'] [data-${component}]`
		return `${selector} {\n  /* ${component} styles */\n}\n`
	})

	return header + blocks.join('\n')
}

/**
 * List all theme styles defined in rokkit.config.js plus any custom CSS files in src/themes/.
 * @param {{
 *   readConfig?: () => Record<string, unknown>,
 *   listFiles?: (dir: string) => string[],
 *   cwd?: string
 * }} adapters
 */
function getCustomThemes(adapters) {
	const cwd = adapters.cwd ?? process.cwd()
	const themesDir = resolve(cwd, 'src/themes')
	const listFiles = adapters.listFiles ?? ((dir) => (existsSync(dir) ? readdirSync(dir) : []))
	return listFiles(themesDir)
		.filter((f) => f.endsWith('.css'))
		.map((f) => f.replace(/\.css$/, ''))
}

function printThemeSection(label, items) {
	if (items.length === 0) return
	console.info(label)
	for (const t of items) console.info(`    ${t}`)
}

function printThemeList(builtIn, custom) {
	console.info('Rokkit Themes\n')
	printThemeSection('  Built-in (from @rokkit/themes):', builtIn)
	printThemeSection('\n  Custom (src/themes/):', custom)
	if (builtIn.length === 0 && custom.length === 0) {
		console.info('  No themes found.')
		console.info('  Run `rokkit theme create --name <name>` to scaffold a custom theme.')
	}
}

export async function runThemeList(adapters = {}) {
	const config = await loadConfig(adapters)
	const builtIn = config?.themes ?? []
	const custom = getCustomThemes(adapters)
	printThemeList(builtIn, custom)
}

/**
 * Create a new custom theme CSS stub at src/themes/<name>.css.
 * @param {string} name
 * @param {{
 *   writeFile?: (path: string, content: string) => void,
 *   exists?: (path: string) => boolean,
 *   mkdir?: (dir: string) => void,
 *   cwd?: string
 * }} adapters
 */
function resolveThemeAdapters(adapters) {
	return {
		cwd: adapters.cwd ?? process.cwd(),
		writeFile: adapters.writeFile ?? writeFileSync,
		exists: adapters.exists ?? existsSync,
		mkdir: adapters.mkdir ?? ((dir) => mkdirSync(dir, { recursive: true }))
	}
}

export function runThemeCreate(name, adapters = {}) {
	if (!name) {
		console.error('Usage: rokkit theme create --name <name>')
		return
	}

	const { cwd, writeFile, exists, mkdir } = resolveThemeAdapters(adapters)
	const themesDir = resolve(cwd, 'src/themes')
	const filePath = join(themesDir, `${name}.css`)

	if (exists(filePath)) {
		console.warn(`Theme file already exists: src/themes/${name}.css`)
		return
	}

	if (!exists(themesDir)) mkdir(themesDir)

	writeFile(filePath, generateThemeStub(name))
	console.info(`Created src/themes/${name}.css`)
	console.info(
		`\nImport it in src/app.css:\n  @import './themes/${name}.css';\n` +
			`\nApply it: <body data-style="${name}">`
	)
}

/**
 * CLI entry point for `rokkit theme` subcommands.
 * @param {string} sub — 'list' | 'create'
 * @param {{ name?: string }} opts
 */
export async function theme(sub, opts = {}) {
	if (sub === 'create') {
		runThemeCreate(opts.name)
	} else {
		await runThemeList()
	}
}

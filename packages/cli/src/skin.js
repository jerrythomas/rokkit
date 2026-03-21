/* eslint-disable no-console */
import { writeFileSync } from 'fs'
import { resolve } from 'path'
import { loadConfig } from './config.js'

const SKIN_TOKEN_DEFAULTS = {
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
 * Generate a skin scaffold object with all token keys set to default color names.
 * @returns {Record<string, string>}
 */
export function generateSkinScaffold() {
	return { ...SKIN_TOKEN_DEFAULTS }
}

/**
 * Add a new skin entry to a config object (pure, no side effects).
 * @param {Record<string, unknown>} config
 * @param {string} name
 * @returns {Record<string, unknown>}
 */
export function addSkinToConfig(config, name) {
	const skins = config.skins ?? {}
	return {
		...config,
		skins: { ...skins, [name]: generateSkinScaffold() }
	}
}

/**
 * Serialize a rokkit config back to a JS module string.
 * @param {Record<string, unknown>} config
 * @returns {string}
 */
export function serializeConfig(config) {
	return `export default ${JSON.stringify(config, null, 2)}\n`
}

/**
 * List all skins defined in rokkit.config.js.
 * @param {{
 *   readConfig?: () => Record<string, unknown>,
 *   cwd?: string
 * }} adapters
 */
export async function runSkinList(adapters = {}) {
	const config = await loadConfig(adapters)
	if (!config) {
		console.error('rokkit.config.js not found. Run `rokkit init` first.')
		return
	}
	const skins = config.skins ?? {}
	const names = Object.keys(skins)
	if (names.length === 0) {
		console.info('No skins defined in rokkit.config.js.')
		console.info('Run `rokkit skin create --name <name>` to add one.')
		return
	}
	console.info('Defined skins:\n')
	for (const name of names) {
		const tokens = Object.entries(skins[name])
			.map(([k, v]) => `${k}: ${v}`)
			.join(', ')
		console.info(`  ${name}  —  ${tokens}`)
	}
}

/**
 * Create a new skin entry in rokkit.config.js.
 * @param {string} name
 * @param {{
 *   readConfig?: () => Record<string, unknown>,
 *   writeConfig?: (config: Record<string, unknown>) => void,
 *   cwd?: string
 * }} adapters
 */
export async function runSkinCreate(name, adapters = {}) {
	if (!name) {
		console.error('Usage: rokkit skin create --name <name>')
		return
	}

	const config = await loadConfig(adapters)
	if (!config) {
		console.error('rokkit.config.js not found. Run `rokkit init` first.')
		return
	}

	if (config.skins?.[name]) {
		console.warn(`Skin "${name}" already exists in rokkit.config.js.`)
		return
	}

	const updated = addSkinToConfig(config, name)
	await saveConfig(updated, adapters)

	console.info(`Added skin "${name}" to rokkit.config.js`)
	console.info(
		`\nCustomize the color tokens in rokkit.config.js → skins.${name}\n` +
			`Then apply with: <body data-skin="${name}">`
	)
}

/**
 * Write updated config using injected adapter or real filesystem.
 * @param {Record<string, unknown>} config
 * @param {{ writeConfig?: (config: Record<string, unknown>) => void, cwd?: string }} adapters
 */
async function saveConfig(config, adapters) {
	if (adapters.writeConfig) {
		adapters.writeConfig(config)
		return
	}
	const cwd = adapters.cwd ?? process.cwd()
	writeFileSync(resolve(cwd, 'rokkit.config.js'), serializeConfig(config))
}

/**
 * CLI entry point for `rokkit skin` subcommands.
 * @param {string} sub — 'list' | 'create'
 * @param {{ name?: string }} opts
 */
export async function skin(sub, opts = {}) {
	if (sub === 'create') {
		await runSkinCreate(opts.name)
	} else {
		await runSkinList()
	}
}

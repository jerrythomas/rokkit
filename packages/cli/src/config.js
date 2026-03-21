import { existsSync } from 'fs'
import { resolve } from 'path'

/**
 * Load rokkit.config.js using injected adapter or real filesystem.
 * Returns null (not an error) if config is absent or fails to load.
 * @param {{ readConfig?: () => Record<string, unknown>, cwd?: string }} adapters
 * @returns {Promise<Record<string, unknown> | null>}
 */
export async function loadConfig(adapters) {
	if (adapters.readConfig) return adapters.readConfig()

	const cwd = adapters.cwd ?? process.cwd()
	const configPath = resolve(cwd, 'rokkit.config.js')
	if (!existsSync(configPath)) return null

	try {
		const { default: config } = await import(`file://${configPath}?t=${Date.now()}`)
		return config
	} catch {
		return null
	}
}
